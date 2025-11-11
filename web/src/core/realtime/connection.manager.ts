import { toast } from "sonner";

import { env } from "~/env";

type LifecycleEvent = "open" | "message" | "error" | "close";
type EventHandler = (payload: unknown) => void;

const WS_BASE_URL = (env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /^http/,
  "ws",
);

/**
 * Manages the lifecycle of the realtime WebSocket connection.
 * Handles auth, message dispatching, and exponential-backoff reconnection.
 */
export class ConnectionManager {
  private ws: WebSocket | null = null;
  private url: string | null = null;
  private token: string | null = null;
  private workflowId: number | null = null;
  private readonly handlers = new Map<LifecycleEvent, Set<EventHandler>>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private explicitlyClosed = false;

  private static readonly MAX_RECONNECT_ATTEMPTS = 10;
  private static readonly INITIAL_RECONNECT_DELAY = 1_000; // 1s
  private static readonly MAX_RECONNECT_DELAY = 30_000; // 30s

  /**
   * Register for WebSocket lifecycle events.
   */
  public on(event: LifecycleEvent, handler: EventHandler): () => void {
    const set = this.handlers.get(event) ?? new Set<EventHandler>();
    set.add(handler);
    this.handlers.set(event, set);
    return () => {
      set.delete(handler);
    };
  }

  /**
   * Establish a realtime connection for the specified workflow.
   */
  public connect(workflowId: number, token: string) {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      console.log("[WebSocket] Connection already active.");
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.explicitlyClosed = false;
    this.workflowId = workflowId;
    this.token = token;
    this.url = `${WS_BASE_URL}/ws/${workflowId}?token=${token}`;

    try {
      console.log(
        `[WebSocket] Connecting to ${this.url.split("?")[0]} (workflow ${workflowId}).`,
      );
      this.ws = new WebSocket(this.url);
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onerror = this.handleError;
      this.ws.onclose = this.handleClose;
    } catch (error) {
      console.error("[WebSocket] Failed to initialize connection:", error);
      this.scheduleReconnect();
    }
  }

  /**
   * Gracefully close the active connection and stop reconnection attempts.
   */
  public disconnect() {
    this.explicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, "Client closed connection");
    }
    this.ws = null;
    this.reconnectAttempts = 0;
    this.token = null;
    this.workflowId = null;
    this.url = null;
    console.log("[WebSocket] Connection closed explicitly.");
  }

  /**
   * Send a payload to the server when the socket is open.
   */
  public send(message: unknown): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Cannot send message: socket is not open.", message);
      return false;
    }
    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("[WebSocket] Failed to send message:", error);
      return false;
    }
  }

  private emit(event: LifecycleEvent, payload: unknown) {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[WebSocket] Error in '${event}' handler:`, error);
      }
    });
  }

  private handleOpen = () => {
    console.log("[WebSocket] Connection established.");
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.emit("open", {});
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data);
      this.emit("message", payload);
    } catch (error) {
      console.error("[WebSocket] Failed to parse message:", event.data, error);
    }
  };

  private handleError = (event: Event) => {
    console.error("[WebSocket] Error event:", event);
    this.emit("error", event);
  };

  private handleClose = (event: CloseEvent) => {
    console.log(
      `[WebSocket] Connection closed (code ${event.code}, reason: ${event.reason || "n/a"}).`,
    );
    this.ws = null;
    this.emit("close", { code: event.code, reason: event.reason });

    if (this.explicitlyClosed) {
      return;
    }

    if (event.code === 4001 || event.code === 4003) {
      console.error(
        `[WebSocket] Authentication failed with code ${event.code}. Will not attempt reconnection.`,
      );
      return;
    }

    this.scheduleReconnect();
  };

  /**
   * Schedule a reconnection attempt with exponential backoff and jitter.
   */
  private scheduleReconnect() {
    if (!this.token || !this.workflowId) {
      console.error("[WebSocket] Missing workflow or token; cannot schedule reconnect.");
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    if (this.reconnectAttempts >= ConnectionManager.MAX_RECONNECT_ATTEMPTS) {
      console.error("[WebSocket] Max reconnection attempts reached. Giving up.");
      toast.error(
        "Real-time connection failed repeatedly. Please refresh to try again.",
      );
      return;
    }

    this.reconnectAttempts += 1;
    const baseDelay =
      ConnectionManager.INITIAL_RECONNECT_DELAY *
      Math.pow(2, this.reconnectAttempts - 1);
    const delay = Math.min(baseDelay, ConnectionManager.MAX_RECONNECT_DELAY);
    const jitter = delay * 0.2 * Math.random();
    const reconnectDelay = delay + jitter;

    console.log(
      `[WebSocket] Reconnecting in ${(reconnectDelay / 1000).toFixed(2)}s (attempt ${this.reconnectAttempts}).`,
    );
    if (this.reconnectAttempts > 1) {
      toast.warning(
        `Real-time connection lost. Reconnecting... (Attempt ${this.reconnectAttempts})`,
      );
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.workflowId!, this.token!);
    }, reconnectDelay);
  }
}
