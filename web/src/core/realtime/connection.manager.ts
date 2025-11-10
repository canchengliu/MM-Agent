// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { toast } from "sonner";

import { env } from "~/env";

type MessageCallback = (data: unknown) => void;
type CloseCallback = (event: CloseEvent) => void;
type ErrorCallback = (event: Event) => void;
type OpenCallback = () => void;
type ReconnectCallback = () => void;

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;
const JITTER_FACTOR = 0.2;

const getWsUrl = (workflowId: number, token: string): string => {
  const apiUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const url = new URL(apiUrl);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return `${protocol}//${url.host}/ws/${workflowId}?token=${token}`;
};

class ConnectionManager {
  private ws: WebSocket | null = null;
  private workflowId: number | null = null;
  private token: string | null = null;

  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private manuallyClosed = false;

  private onMessageCallback: MessageCallback | null = null;
  private onCloseCallback: CloseCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;
  private onOpenCallback: OpenCallback | null = null;
  private onReconnectCallback: ReconnectCallback | null = null;

  public onOpen(callback: OpenCallback) {
    this.onOpenCallback = callback;
  }

  public onMessage(callback: MessageCallback) {
    this.onMessageCallback = callback;
  }

  public onClose(callback: CloseCallback) {
    this.onCloseCallback = callback;
  }

  public onError(callback: ErrorCallback) {
    this.onErrorCallback = callback;
  }

  public onReconnect(callback: ReconnectCallback) {
    this.onReconnectCallback = callback;
  }

  public connect(workflowId: number, token: string) {
    if (typeof window === "undefined") {
      return;
    }

    if (
      this.workflowId === workflowId &&
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (this.ws) {
      this.disconnect();
    }

    this.workflowId = workflowId;
    this.token = token;
    this.manuallyClosed = false;
    this.reconnectAttempts = 0;

    const wsUrl = getWsUrl(workflowId, token);
    console.log(`Establishing WebSocket connection: ${wsUrl}`);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }

  public disconnect() {
    this.manuallyClosed = true;

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;

      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close(1000, "Client initiated disconnect");
      }

      this.ws = null;
    }

    this.workflowId = null;
    this.token = null;
    this.reconnectAttempts = 0;
  }

  private handleOpen = () => {
    console.log("WebSocket connection established.");

    if (this.reconnectAttempts > 0) {
      this.onReconnectCallback?.();
    }

    this.reconnectAttempts = 0;
    this.onOpenCallback?.();
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data);
      this.onMessageCallback?.(payload);
    } catch (error) {
      console.error("Failed to parse WebSocket payload.", error);
    }
  };

  private handleClose = (event: CloseEvent) => {
    this.ws = null;
    this.onCloseCallback?.(event);

    if (this.manuallyClosed) {
      return;
    }

    if (event.code === 4001) {
      toast.error("Real-time connection failed: Authentication error.");
      console.error("WebSocket authentication error (4001).");
      return;
    }

    if (event.code === 4003) {
      toast.error("Real-time connection failed: Authorization error.");
      console.error("WebSocket authorization error (4003).");
      return;
    }

    this.scheduleReconnect();
  };

  private handleError = (event: Event) => {
    console.error("WebSocket error:", event);
    this.onErrorCallback?.(event);
    // onclose handles reconnection.
  };

  private scheduleReconnect() {
    if (!this.workflowId || !this.token) {
      return;
    }

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      toast.error("Unable to restore real-time connection.");
      console.error("Max WebSocket reconnect attempts reached.");
      return;
    }

    const backoff = Math.min(
      MAX_RECONNECT_DELAY_MS,
      INITIAL_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempts,
    );
    const jitter = backoff * JITTER_FACTOR * (Math.random() - 0.5);
    const delay = Math.round(backoff + jitter);

    if (this.reconnectAttempts === 0) {
      toast.warning("Connection lost. Trying to reconnect...");
    }

    console.log(
      `WebSocket disconnected. Retrying in ${Math.max(
        0,
        Math.round(delay / 1000),
      )}s (attempt ${this.reconnectAttempts + 1}).`,
    );

    this.reconnectTimeoutId = setTimeout(() => {
      if (!this.manuallyClosed && this.workflowId && this.token) {
        this.connect(this.workflowId, this.token);
      }
    }, Math.max(0, delay));

    this.reconnectAttempts += 1;
  }
}

export const connectionManager = new ConnectionManager();
