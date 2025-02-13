import { http, HttpResponse, delay, JsonBodyType } from "msw";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types/chat";
import { ChatMessageRequest, ChatResponse } from "@/types/api";
import { generateResponse } from "./responseGenerator";
import { createLogger } from "@/lib/logger";

const logger = createLogger("MockChatAPI");

// Configuration
const STREAM_CHUNK_DELAY = 5;
const MESSAGE_DELAY = 3;
const CHUNK_SIZE = 2; // Number of characters to send in each chunk
const encoder = new TextEncoder();

// Helper to chunk the response
function* chunkResponse(text: string): Generator<string> {
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    yield text.slice(i, i + CHUNK_SIZE);
  }
}

// Error handler wrapper
const withErrorHandler = async <T>(
  handler: () => Promise<T>
): Promise<HttpResponse> => {
  try {
    const result = await handler();
    return HttpResponse.json(result as JsonBodyType);
  } catch (error) {
    logger.error("API Request Failed", error as Error);
    return new HttpResponse(
      JSON.stringify({ type: "error", message: "Internal server error" }),
      { status: 500 }
    );
  }
};

// Regular message endpoint
export const sendMessage = http.post("/api/chat", async ({ request }) => {
  return withErrorHandler(async () => {
    logger.debug("Message Request Started", {
      endpoint: "/api/chat",
      delay: MESSAGE_DELAY,
    });

    await delay(MESSAGE_DELAY);
    const { message } = (await request.json()) as ChatMessageRequest;

    const response: Message = {
      id: uuidv4(),
      threadId: uuidv4(),
      content: generateResponse(message),
      timestamp: Date.now(),
      sender: "assistant",
      status: "complete",
      parentId: null,
    };

    logger.info("Message Request Completed", {
      messageId: response.id,
      threadId: response.threadId,
      status: response.status,
    });

    return response;
  });
});

// Streaming message endpoint
export const streamMessage = http.post(
  "/api/chat/stream",
  async ({ request }) => {
    try {
      logger.debug("Stream Request Started", {
        endpoint: "/api/chat/stream",
        chunkDelay: STREAM_CHUNK_DELAY,
        chunkSize: CHUNK_SIZE,
      });

      const { message } = (await request.json()) as ChatMessageRequest;
      const responseText = generateResponse(message);

      // Create a stream of characters
      const stream = new ReadableStream({
        async start(controller) {
          let chunkCount = 0;
          for (const chunk of chunkResponse(responseText)) {
            await delay(STREAM_CHUNK_DELAY);
            const response: ChatResponse = {
              type: "stream",
              content: chunk,
            };
            controller.enqueue(encoder.encode(JSON.stringify(response) + "\n"));
            chunkCount++;
          }
          logger.debug("Stream Generation Completed", {
            totalChunks: chunkCount,
            responseLength: responseText.length,
          });
          controller.close();
        },
      });

      logger.info("Stream Response Started", {
        contentType: "text/event-stream",
        responseLength: responseText.length,
      });

      return new HttpResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      logger.error("Stream Request Failed", error as Error);
      const errorResponse: ChatResponse = {
        type: "error",
        message: "Failed to stream response",
      };
      return new HttpResponse(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }
);
