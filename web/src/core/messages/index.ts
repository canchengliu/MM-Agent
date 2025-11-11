export interface Resource {
  id: string;
  title: string;
  url?: string;
  type?: string;
}

export interface Message {
  id: string;
  threadId: string;
  role: string;
  content: string;
  contentChunks?: string[];
  reasoningContent?: string;
  reasoningContentChunks?: string[];
  resources?: Resource[];
  agent?: string;
  toolCalls?: Array<{ id: string }>;
  isStreaming?: boolean;
  interruptFeedback?: string;
  finishReason?: string;
  options?: unknown;
}

export function mergeMessage(message: Message, event: unknown): Message {
  if (event && typeof event === "object") {
    return { ...message, ...(event as Record<string, unknown>) };
  }
  return message;
}
