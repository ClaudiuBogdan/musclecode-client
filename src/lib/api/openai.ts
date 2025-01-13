import OpenAI from "openai";
import { Message } from "../../types/chat";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { apiConfig } from "../../config/api";

const openaiClient = new OpenAI({
  baseURL: apiConfig.baseURL,
  apiKey: apiConfig.apiKey,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  dangerouslyAllowBrowser: true,
});

function convertMessagesToOpenAIFormat(
  messages: Message[]
): ChatCompletionMessageParam[] {
  return messages.map((message) => ({
    role: message.sender === "user" ? "user" : "assistant",
    content: message.content,
  }));
}

export async function streamChatCompletion(
  content: string,
  history: Message[] = []
): Promise<ReadableStream<string>> {
  const messages = [
    ...convertMessagesToOpenAIFormat(history),
    { role: "user" as const, content },
  ];

  const response = await openaiClient.chat.completions.create({
    model: apiConfig.model,
    messages,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          const response = {
            type: "stream",
            content,
          };
          controller.enqueue(JSON.stringify(response) + "\n");
        }
      }
      controller.close();
    },
  });

  return stream;
}

export async function chatCompletion(
  content: string,
  history: Message[] = []
): Promise<string> {
  const messages = [
    ...convertMessagesToOpenAIFormat(history),
    { role: "user" as const, content },
  ];

  const response = await openaiClient.chat.completions.create({
    model: apiConfig.model,
    messages,
  });

  return response.choices[0]?.message?.content || "";
}
