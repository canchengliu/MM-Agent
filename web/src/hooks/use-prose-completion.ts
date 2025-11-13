import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { resolveServiceURL } from "~/core/api/resolve-service-url";
import { fetchStream } from "~/core/sse";

/**
 * Hook for handling AI text completion streaming within the rich text editor.
 * Manages streaming state and provides optimized updates for rendering.
 */
export function useProseCompletion() {
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to manage streaming state efficiently without causing excessive re-renders
  const chunkBuffer = useRef("");
  const fullText = useRef("");
  const updateTimer = useRef<NodeJS.Timeout | undefined>();
  const isMounted = useRef(true);

  useEffect(() => {
    // Cleanup function to handle component unmount during streaming
    return () => {
      isMounted.current = false;
      if (updateTimer.current) clearTimeout(updateTimer.current);
    };
  }, []);

  // Function to update the state with buffered chunks
  const flushBuffer = useCallback(() => {
    if (chunkBuffer.current && isMounted.current) {
      fullText.current += chunkBuffer.current;
      setCompletion(fullText.current);
      chunkBuffer.current = "";
    }
  }, []);

  // Function to schedule a buffer flush at a controlled rate
  const scheduleUpdate = useCallback(() => {
    if (updateTimer.current) return; // Update already scheduled
    updateTimer.current = setTimeout(() => {
        flushBuffer();
        updateTimer.current = undefined;
    }, 50); // Update rate (e.g., 20fps)
  }, [flushBuffer]);

  const complete = useCallback(
    async (prompt: string, options?: { body?: Record<string, any> }) => {
      setIsLoading(true);
      setError(null);
      // Reset state for new completion
      fullText.current = "";
      chunkBuffer.current = "";
      setCompletion("");

      try {
        const response = await fetchStream(
          // Assuming an endpoint exists for prose generation
          resolveServiceURL("/api/prose/generate"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
              ...options?.body,
            }),
          },
        );

        // Process the streaming response
        for await (const chunk of response) {
          if (!isMounted.current) break;

          if (chunk.type === 'data' && typeof chunk.data === 'string') {
            chunkBuffer.current += chunk.data;
            scheduleUpdate();
          } else if (chunk.type === 'error') {
              throw new Error(chunk.data);
          }
        }

        // Final update after stream ends
        if (isMounted.current) {
            if (updateTimer.current) clearTimeout(updateTimer.current);
            flushBuffer();
        }

      } catch (e) {
        const error = e instanceof Error ? e : new Error("An error occurred during AI completion.");
        if (isMounted.current) {
            setError(error);
        }
        // Display error only if it's not a 404 warning handled in fetchStream
        if (!error.message.includes("(404)")) {
            toast.error(error.message);
        }
      } finally {
        if (isMounted.current) {
            setIsLoading(false);
        }
      }
    },
    [scheduleUpdate, flushBuffer],
  );

  const reset = useCallback(() => {
    if (updateTimer.current) clearTimeout(updateTimer.current);
    setCompletion("");
    setError(null);
    setIsLoading(false);
    fullText.current = "";
    chunkBuffer.current = "";
  }, []);

  return {
    completion,
    complete,
    isLoading,
    error,
    reset,
  };
}

