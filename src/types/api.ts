export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequest<T = unknown> {
  body: T;
  headers?: Record<string, string>;
}

export interface ChatMessageRequest {
  message: string;
  contextId?: string;
}

export interface ChatStreamResponse {
  type: "stream";
  content: string;
}

export interface ChatErrorResponse {
  type: "error";
  message: string;
}

export type ChatResponse = ChatStreamResponse | ChatErrorResponse;
