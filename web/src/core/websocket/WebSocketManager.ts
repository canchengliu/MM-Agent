import { env } from "~/env";

import { useAuthStore } from "../store/AuthStore";
import { useConnectionStore } from "../store/ConnectionStore";
import { useWorkflowStore } from "../store/WorkflowStore";

import { handleEvent } from "./EventHandler";
import type { EventPayload } from "./types";

const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 15000;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private workflowId: number | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private shouldAttemptReconnect = false;

  connect(workflowId: number) {
    if (typeof window === "undefined") {
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      useConnectionStore
        .getState()
        .setDisconnected({ error: "缺少认证信息，无法建立实时连接。" });
      return;
    }

    if (
      this.socket &&
      this.workflowId === workflowId &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.workflowId = workflowId;
    this.shouldAttemptReconnect = true;
    this.reconnectAttempts = 0;

    this.openSocket(workflowId, token);
  }

  disconnect() {
    this.shouldAttemptReconnect = false;
    this.workflowId = null;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();

    if (this.socket) {
      this.teardownSocket(this.socket);
      this.socket.close(1000, "Client disconnected");
      this.socket = null;
    }

    useConnectionStore.getState().reset();
  }

  private openSocket(workflowId: number, token: string) {
    if (typeof window === "undefined") {
      return;
    }

    this.clearReconnectTimer();

    if (this.socket) {
      this.teardownSocket(this.socket);
      this.socket.close(1000, "Reopening WebSocket connection");
      this.socket = null;
    }

    const connectionStore = useConnectionStore.getState();
    connectionStore.setConnecting(workflowId);

    const url = this.buildWebSocketUrl(workflowId, token);
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => this.handleOpen();
    socket.onmessage = (event) => {
      void this.handleMessage(event);
    };
    socket.onerror = (event) => this.handleError(event);
    socket.onclose = (event) => this.handleClose(event);
  }

  private handleOpen() {
    this.reconnectAttempts = 0;
    useConnectionStore.getState().setConnected();

    const workflowStore = useWorkflowStore.getState();
    void workflowStore.refreshWorkflow().catch((error) => {
      console.error("[WebSocket] Failed to refresh workflow after (re)connect", error);
    });
  }

  private async handleMessage(event: MessageEvent) {
    try {
      const raw = await this.extractMessage(event.data);
      const payload = JSON.parse(raw) as EventPayload;
      handleEvent(payload);
    } catch (error) {
      console.error("[WebSocket] Failed to process incoming message", error);
    }
  }

  private handleError(event: Event) {
    console.error("[WebSocket] Connection error", event);
  }

  private handleClose(event: CloseEvent) {
    if (this.socket) {
      this.teardownSocket(this.socket);
      this.socket = null;
    }

    const connectionStore = useConnectionStore.getState();
    const { code } = event;

    if (!this.shouldAttemptReconnect || !this.workflowId || code === 1000) {
      connectionStore.setDisconnected({ code, error: code === 1000 ? null : event.reason });
      return;
    }

    if (code === 4001) {
      connectionStore.setDisconnected({ code, error: "认证失败，请重新登录。" });
      useAuthStore.getState().logout();
      this.shouldAttemptReconnect = false;
      return;
    }

    if (code === 4003) {
      connectionStore.setDisconnected({ code, error: "没有访问该工作流的权限。" });
      this.shouldAttemptReconnect = false;
      return;
    }

    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (typeof window === "undefined" || !this.workflowId) {
      return;
    }

    this.reconnectAttempts += 1;
    useConnectionStore.getState().setReconnecting();

    const baseDelay = Math.min(
      BASE_BACKOFF_MS * 2 ** (this.reconnectAttempts - 1),
      MAX_BACKOFF_MS,
    );
    const jitter = baseDelay * 0.2 * Math.random();
    const delay = baseDelay + jitter;

    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      if (!this.shouldAttemptReconnect || !this.workflowId) {
        return;
      }
      const token = useAuthStore.getState().token;
      if (!token) {
        useConnectionStore
          .getState()
          .setDisconnected({ error: "缺少认证信息，无法重新连接。" });
        this.shouldAttemptReconnect = false;
        return;
      }
      this.openSocket(this.workflowId, token);
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private teardownSocket(socket: WebSocket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
  }

  private async extractMessage(data: MessageEvent["data"]): Promise<string> {
    if (typeof data === "string") {
      return data;
    }
    if (data instanceof Blob) {
      return data.text();
    }
    if (data instanceof ArrayBuffer) {
      return new TextDecoder().decode(data);
    }
    throw new Error("Unsupported WebSocket payload type");
  }

  private buildWebSocketUrl(workflowId: number, token: string) {
    const base = this.resolveBaseUrl();
    const url = new URL(`ws/${workflowId}`, base);
    url.searchParams.set("token", token);
    return url.toString();
  }

  private resolveBaseUrl() {
    const rawBase =
      env.NEXT_PUBLIC_WS_URL ??
      env.NEXT_PUBLIC_API_URL ??
      (typeof window !== "undefined" ? window.location.origin : null);

    if (!rawBase) {
      throw new Error("无法解析 WebSocket 基础地址");
    }

    const url = new URL(rawBase);
    if (url.protocol === "http:") {
      url.protocol = "ws:";
    } else if (url.protocol === "https:") {
      url.protocol = "wss:";
    }

    if (!env.NEXT_PUBLIC_WS_URL) {
      url.pathname = url.pathname.replace(/\/api\/?$/, "/");
    }

    if (!url.pathname.endsWith("/")) {
      url.pathname += "/";
    }

    url.search = "";
    url.hash = "";
    return url.toString();
  }
}

export const webSocketManager = new WebSocketManager();
