import { Message } from "../../types/chat";

export async function sendMessage(content: string): Promise<Message> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: content }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export async function streamMessage(
  content: string
): Promise<ReadableStream<string>> {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: content }),
  });

  if (!response.ok) {
    throw new Error("Failed to stream message");
  }

  const textDecoder = new TextDecoder();
  const transformStream = new TransformStream({
    transform(chunk: Uint8Array, controller) {
      const text = textDecoder.decode(chunk);
      controller.enqueue(text);
    },
  });

  return response.body!.pipeThrough(transformStream);
}
