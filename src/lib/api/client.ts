// lib/api/client.ts
import {
  fetchEventSource
} from "@microsoft/fetch-event-source";
import axios from "axios";


import { env } from "@/config/env";
import { AppError, createAuthError } from "@/lib/errors/types";

import { getAuthService } from "../auth/auth-service";
import { AuthErrorCode, AuthError } from "../auth/errors";
import { createLogger } from "../logger";


import type { ServerSentEvent } from "@/components/canvas/types";
import type { ApiError } from "@/types/api";
import type {
  EventSourceMessage} from "@microsoft/fetch-event-source";

const logger = createLogger("ApiClient");

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authService = getAuthService();

/**
 * Gets authentication headers with token and user information
 * Central utility to avoid duplication across request methods
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const [user, token] = await Promise.all([
      authService.getUser(),
      authService.getToken(),
    ]);

    if (!token) {
      logger.error("No Authentication Token Available");
      throw createAuthError(
        AuthErrorCode.TOKEN_NOT_FOUND,
        "No authentication token available"
      );
    }

    return {
      Authorization: `Bearer ${token}`,
      "X-User-Id": user?.id || "",
    };
  } catch (error) {
    // Log the error for diagnostics
    logger.error("Authentication Token Retrieval Failed", {
      error: error instanceof Error ? error.message : String(error),
      operation: "getAuthHeaders",
    });

    // Propagate the error
    if (error instanceof AuthError) {
      throw error;
    }

    throw createAuthError(
      AuthErrorCode.UNAUTHORIZED,
      "Failed to authenticate request"
    );
  }
}

/**
 * Common function to handle 401 unauthorized errors
 */
export async function handle401Error(
  context = "API Request"
): Promise<never> {
  logger.error(`Authentication Token Invalid - ${context}`, {
    operation: context,
  });

  try {
    await authService.login();
  } catch {
    // Just fall through to throwing the error
  }

  throw createAuthError(
    AuthErrorCode.SESSION_EXPIRED,
    "Session expired. Please log in again."
  );
}

/**
 * Common function to handle 403 forbidden errors
 */
export function handle403Error(): never {
  throw createAuthError(
    AuthErrorCode.INSUFFICIENT_PERMISSIONS,
    "You don't have permission to perform this action"
  );
}

/**
 * Standardized error transformer for consistent error handling
 */
export function transformError(
  error: unknown,
  errorType: "api" | "runtime" = "runtime"
): never {
  if (error instanceof AuthError) {
    throw error;
  }

  throw AppError.fromError(
    error instanceof Error ? error : new Error(String(error)),
    errorType
  );
}

// Use the centralized auth headers function in the request interceptor
apiClient.interceptors.request.use(async (config) => {
  const headers = await getAuthHeaders();

  // Apply the headers to the config
  config.headers.Authorization = headers.Authorization;
  config.headers["X-User-Id"] = headers["X-User-Id"];

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // Handle authentication errors
      if (error.response?.status === 401) {
        return handle401Error("responseInterceptor");
      }

      // Handle permission errors
      if (error.response?.status === 403) {
        return handle403Error();
      }

      // Handle other API errors
      const apiError: ApiError = {
        name: "ApiError",
        message: error.response?.data?.message ?? "An error occurred",
        status: error.response?.status ?? 500,
      };
      return transformError(new Error(apiError.message), "api");
    }

    // Handle non-axios errors
    return transformError(error);
  }
);

/**
 * Creates a streaming request that handles Server-Sent Events (SSE)
 * @param url The URL to make the request to
 * @param method The HTTP method to use
 * @param data The data to send in the request body
 * @returns A ReadableStream of string chunks from the server
 */
export async function streamRequest(
  url: string,
  method: "GET" | "POST" = "POST",
  data?: Record<string, unknown>
): Promise<ReadableStream<string>> {
  try {
    // Ensure we have the full URL
    const fullUrl = new URL(url, apiClient.defaults.baseURL).toString();

    // Get authentication headers using the centralized function
    const authHeaders = await getAuthHeaders();

    // Prepare headers with better organization
    const headers = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...authHeaders,
    };

    // For GET requests with data, add parameters to the URL
    const requestUrl =
      method === "GET" && data
        ? `${fullUrl}?${new URLSearchParams(
            Object.entries(data).map(([k, v]) => [k, String(v)])
          ).toString()}`
        : fullUrl;

    // Prepare the request options with improved organization
    const options: RequestInit = {
      method,
      headers,
      ...(method === "POST" && data ? { body: JSON.stringify(data) } : {}),
    };

    // Make the request
    const response = await fetch(requestUrl, options);

    // Handle response errors with a dedicated function
    await handleResponseErrors(response);

    // Get the response body as a ReadableStream and process it
    return createProcessingStream(response.body!);
  } catch (error) {
    // Use the standardized error transformer
    return transformError(error);
  }
}

/**
 * Handles HTTP error responses
 */
async function handleResponseErrors(response: Response): Promise<void> {
  if (!response.ok) {
    // Handle standard error codes using the centralized functions
    if (response.status === 401) {
      return handle401Error("streamRequest");
    }

    if (response.status === 403) {
      return handle403Error();
    }

    // Handle other errors
    const errorText = await response.text();
    let errorMessage: string;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage =
        errorJson.message || `HTTP error! status: ${response.status}`;
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }

    throw AppError.fromError(new Error(errorMessage), "api");
  }
}

/**
 * Creates a processing stream for SSE messages
 */
function createProcessingStream(body: ReadableStream): ReadableStream<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const buffer = "";

  return new ReadableStream<string>({
    async start(controller) {
      try {
        await processStream(reader, decoder, buffer, controller);
      } catch (error) {
        controller.error(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
    cancel() {
      // Ensure proper cleanup when the stream is cancelled
      reader.cancel().catch((err) => {
        logger.error("Error cancelling reader", {
          error: err instanceof Error ? err.message : String(err),
        });
      });
    },
  });
}

/**
 * Processes the SSE stream data
 */
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  buffer: string,
  controller: ReadableStreamDefaultController<string>
): Promise<void> {
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      controller.close();
      break;
    }

    // Decode the chunk and add to buffer
    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE messages
    const messages = buffer.split("\n\n");
    buffer = messages.pop() || ""; // The last item might be incomplete

    for (const message of messages) {
      processMessage(message, controller);
    }
  }
}

/**
 * Processes a single SSE message
 */
function processMessage(
  message: string,
  controller: ReadableStreamDefaultController<string>
): void {
  if (!message.startsWith("data: ")) return;

  try {
    const jsonStr = message.substring(6).trim();
    if (!jsonStr) return;

    const data = JSON.parse(jsonStr);

    // Handle different event types
    if (data.content) {
      controller.enqueue(data.content);
    } else if (data.error) {
      controller.error(new Error(data.error));
    } else if (data.done) {
      controller.close();
    } else if (typeof data === "string") {
      controller.enqueue(data);
    }
  } catch {
    // If parsing fails, try to use the raw message content
    const rawContent = message.substring(6).trim();
    if (rawContent) {
      controller.enqueue(rawContent);
    }
  }
}

/**
 * Callbacks for handling SSE events.
 */
export interface SSECallbacks {
  /** Called when the connection is successfully opened. */
  onOpen?: () => void;
  /** Called for each message received from the server. */
  onMessage: (data: ServerSentEvent) => void; // data is typically the parsed JSON from the 'data:' field
  /** Called when an error occurs (network error, server error during connection). */
  onError: (error: Error) => void;
  /** Optional: Called when the connection is closed by the server or explicitly. */
  onClose?: () => void;
}

/**
 * Controller object returned by listenToSSE to manage the connection.
 */
export interface SSEController {
  /** Closes the SSE connection. */
  disconnect: () => void;
}

/**
 * Establishes a connection to a Server-Sent Events (SSE) endpoint
 * with authentication headers and handles events using callbacks.
 *
 * Requires the `@microsoft/fetch-event-source` library.
 *
 * @param url The relative or absolute URL of the SSE endpoint.
 * @param callbacks An object containing onOpen, onMessage, onError, and onClose callbacks.
 * @param method The HTTP method to use (usually GET for SSE, but POST can be used to trigger).
 * @param payload Optional data payload for POST requests.
 * @returns An SSEController object with a `disconnect` method.
 */
export function listenToSSE(
  url: string,
  callbacks: SSECallbacks,
  method: "GET" | "POST" = "GET", // Default to GET for standard SSE
  payload?: Record<string, unknown>
): SSEController {
  const { onOpen, onMessage, onError, onClose } = callbacks;
  const abortController = new AbortController();

  // Use a wrapper function to ensure auth headers are fetched asynchronously
  const connect = async () => {
    try {
      // 1. Get Authentication Headers
      const authHeaders = await getAuthHeaders();

      // 2. Prepare Headers for fetchEventSource
      const headers: Record<string, string> = {
        Accept: "text/event-stream",
        ...authHeaders, // Include Authorization and X-User-Id
        ...(method === "POST" &&
          payload && { "Content-Type": "application/json" }),
      };

      // 3. Construct Full URL
      const fullUrl = new URL(url, apiClient.defaults.baseURL).toString();
      logger.info(`Connecting to SSE endpoint: ${method} ${fullUrl}`);

      // 4. Use fetchEventSource
      await fetchEventSource(fullUrl, {
        method: method,
        headers: headers,
        body:
          method === "POST" && payload ? JSON.stringify(payload) : undefined,
        signal: abortController.signal,
        keepalive: true,
        openWhenHidden: true,

        // Called when the connection is established (response headers received)
        async onopen(response: Response) {
          logger.debug(`SSE connection opened with status: ${response.status}`);
          if (response.ok) {
            onOpen?.(); // Call user's onOpen callback
          } else {
            // Handle initial connection errors (401, 403, etc.)
            if (response.status === 401) {
              // Trigger standard 401 handling (which throws)
              await handle401Error(`SSE Connect (${url})`);
            }
            if (response.status === 403) {
              // Trigger standard 403 handling (which throws)
              handle403Error();
            }
            // Handle other non-OK statuses
            const errorText = await response
              .text()
              .catch(() => `Status: ${response.status}`);
            throw new AppError(
              `SSE connection failed: ${response.status} ${
                response.statusText || ""
              }`.trim(),
              {
                type: "api",
                code: `SSE_ERROR_${response.status}`,
                severity: "error",
                isRecoverable: false,
                context: {
                  status: response.status,
                  statusText: response.statusText,
                  detail: errorText,
                },
              }
            );
          }
        },

        // Called for each message received
        onmessage(event: EventSourceMessage) {
          logger.debug(
            `SSE message received: id=${event.id}, event=${event.event}, data_length=${event.data?.length ?? 0}`
          ); // Log event details including data length
          if (event.event === "ping" || !event.data) {
            // Ignore pings or empty data fields often used as keep-alives
            logger.debug("SSE ping or empty data ignored");
            return;
          }
          try {
            const jsonData = JSON.parse(event.data);
            onMessage(jsonData); // Pass parsed data to user's callback
          } catch (parseError) {
            logger.error("Failed to parse SSE message data as JSON", {
              data: event.data,
              error: parseError,
            });
            // Treat JSON parsing errors as fatal because the client cannot process corrupted data
            onError(
              new AppError("Failed to parse SSE message data", {
                type: "runtime",
                code: "SSE_PARSE_ERROR",
                severity: "error",
                isRecoverable: false,
                context: { originalError: parseError, data: event.data },
              })
            );
          }
        },

        // Called when the connection is closed (by server or abort)
        onclose() {
          logger.info("SSE connection closed.");
          // Don't call onError here, as this is a clean close or intentional disconnect
          onClose?.(); // Call user's onClose callback
        },

        // Called on network errors or errors thrown from onopen/onmessage
        onerror(err: unknown) {
          // Handle intentional abort (manual disconnect) using DOMException
          if (err instanceof DOMException && err.name === "AbortError") {
            logger.warn("SSE connection aborted (likely intentional disconnect).");
            onClose?.(); // Treat abort like a close
            return; // Do not propagate aborts
          }
          logger.error("SSE error occurred", { error: err });
          // Handle AuthError or existing AppError by rethrowing to stop retries
          if (err instanceof AuthError || err instanceof AppError) {
            onError(err);
            throw err;
          }
          // Wrap unknown errors for consistency
          const description =
            err instanceof Error ? err.message : String(err ?? "Unknown SSE error");
          const appErr = AppError.fromError(new Error(description), "api");
          onError(appErr);
          throw appErr; // Stop retries on fatal errors
        },

        // Optional: Customize retry behavior if needed
        // openWhenHidden: false, // Don't connect if tab is hidden
        // retry: 3000, // Retry delay in ms
      });
    } catch (error: unknown) {
      // Catch errors from getAuthHeaders or initial setup before fetchEventSource runs
      logger.error("Error setting up SSE connection", { error });
      // Use transformError to ensure consistency and potentially trigger auth flow
      // It throws, so no need to call onError directly here.
      transformError(error, "api");
    }
  };

  // Start the connection process
  connect();

  // Return the controller object
  return {
    disconnect: () => {
      logger.info("Disconnecting SSE connection...");
      abortController.abort(); // Signal fetchEventSource to stop
      onClose?.(); // Immediately invoke onClose for faster UI feedback if desired
    },
  };
}
