/**
 * Fetches a streaming response (like SSE or NDJSON stream) from the server.
 * (Placeholder implementation required by AI features in the editor).
 */

export interface StreamEventChunk {
  type: 'data' | 'error' | 'done';
  data: string;
}

/**
 * Fetches a stream from the given URL and yields decoded chunks.
 * This implementation assumes a simple text stream (like LLM output).
 */
export async function* fetchStream(
  url: string,
  options: RequestInit
): AsyncGenerator<StreamEventChunk, void, unknown> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error("Network error during fetchStream:", error);
    yield { type: 'error', data: `Network error: ${String(error)}` };
    throw error;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Failed to read error body");
    const errorMessage = `Request failed: ${response.status} ${errorBody}`;

     // Handle case where the API endpoint might not be implemented yet (common during development)
     if (response.status === 404) {
        console.warn(`API endpoint not found: ${url}. AI features might be disabled.`);
        yield { type: 'error', data: "AI feature endpoint not implemented (404)." };
        // We don't throw here, allowing the hook to handle the error gracefully.
        return;
    }

    yield { type: 'error', data: errorMessage };
    // We don't throw here, allowing the hook to handle the error gracefully.
    return;
  }

  if (!response.body) {
    yield { type: 'error', data: 'Response body is empty or not readable' };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        yield { type: 'done', data: '' };
        break;
      }
      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        yield { type: 'data', data: chunk };
      }
    }
  } catch (error) {
    console.error("Error reading stream:", error);
    yield { type: 'error', data: String(error) };
  } finally {
    reader.releaseLock();
  }
}
