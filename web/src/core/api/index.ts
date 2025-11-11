export interface ChatStreamEvent {
  type: string;
  data: Record<string, any>;
}

export async function* chatStream(
  _content?: string,
  _payload?: Record<string, any>,
  _options?: { abortSignal?: AbortSignal },
): AsyncGenerator<ChatStreamEvent> {
  console.warn("chatStream placeholder invoked");
  yield {
    type: "message",
    data: {
      id: "placeholder",
      thread_id: "thread",
      agent: "assistant",
      role: "assistant",
      content: "Placeholder response",
    },
  };
}

export async function generatePodcast(_content: string): Promise<string> {
  console.warn("generatePodcast placeholder invoked");
  return "";
}
