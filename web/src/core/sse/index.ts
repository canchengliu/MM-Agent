export interface ServerSentChunk {
  data: string;
}

export async function* fetchStream(
  url: string,
  init?: RequestInit,
): AsyncGenerator<ServerSentChunk> {
  console.warn("fetchStream placeholder invoked", url, init);
  // Emit an empty completion to keep existing consumers functional.
  yield { data: "" };
}
