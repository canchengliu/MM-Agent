import { toast } from "sonner";
import { type Unsubscribe } from "zustand";

import { type EventPayload } from "~/core/models/events.model";
import { useStore } from "~/core/store";
import { ConnectionStatus } from "~/core/store/slices/connection-status.slice";
import { sleep } from "~/core/utils/time";

import { calculateBackoffDelay } from "./backoff";
import { dispatchEvent } from "./dispatcher";
import { resolveWebSocketURL } from "./resolve-ws-url";

const WS_CLOSE_CODE = {
  NORMAL_CLOSURE: 1000,
  AUTH_FAILED: 4001,
  AUTH_FORBIDDEN: 4003,
} as const;

const RECONNECT_CONFIG = {
  BASE_DELAY: 1000,
  MAX_DELAY: 30000,
  MAX_ATTEMPTS: 10,
} as const;

/**
 * Manages the WebSocket connection lifecycle, authentication, reconnection logic,
 * and synchronization triggers. (Architecture 5.2)
 */
class WebSocketManager {
  private socket: WebSocket | null = null;
  private workflowId: number | null = null;
  private token: string | null = null;

  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private tokenUnsubscribe: Unsubscribe | null = null;
  private intentionalDisconnect = false;

  constructor() {
    this.initializeTokenSubscription();
  }

  private initializeTokenSubscription() {
    // (Implementation remains as provided in context - handles token refresh)
    this.tokenUnsubscribe = useStore.subscribe(
      (state) => state.token,
      (newToken, oldToken) => {
        if (newToken !== oldToken) {
          this.handleTokenChange(newToken);
        }
      },
    );
  }

  private handleTokenChange(newToken: string | null) {
    // (Implementation remains as provided in context - forces reconnection on token change)
    this.token = newToken;
    const isSubscribed = useStore.getState().isSubscribed;

    if (isSubscribed && newToken) {
      console.log("WebSocketManager: Token updated. Forcing reconnection...");
      void this.reconnect(true);
    } else if (!newToken && isSubscribed) {
      console.log("WebSocketManager: Token removed (logout). Disconnecting.");
      this.disconnect();
    }
  }

  public connect(workflowId: number) {
    // (Implementation remains as provided in context - initiates connection)
    if (
      this.workflowId === workflowId &&
      (this.socket || this.reconnectTimeoutId)
    ) {
      console.log(
        `WebSocketManager: Already connected or connecting to workflow ${workflowId}.`,
      );
      return;
    }

    if (this.workflowId !== workflowId && this.workflowId !== null) {
      this.disconnect();
    }

    this.workflowId = workflowId;
    this.intentionalDisconnect = false;
    this.token = useStore.getState().token;

    useStore.getState().setSubscribed(true);

    if (!this.token) {
      console.error(
        "WebSocketManager: Cannot connect without an authentication token.",
      );
      useStore
        .getState()
        .logout(true, "Authentication required for real-time updates.");
      this.updateStatus(ConnectionStatus.Error);
      return;
    }

    this.createSocketConnection();
  }

  private createSocketConnection() {
    // (Implementation remains as provided in context - creates WebSocket instance)
    if (!this.workflowId || !this.token || this.intentionalDisconnect) return;

    const path = `/ws/${this.workflowId}?token=${this.token}`;

    try {
      const url = resolveWebSocketURL(path);

      console.log(
        `WebSocketManager: Connecting to ${url.split("?token=")[0]}...`,
      );
      this.updateStatus(
        this.reconnectAttempts > 0
          ? ConnectionStatus.Reconnecting
          : ConnectionStatus.Connecting,
      );

      this.socket = new WebSocket(url);
      this.socket.onopen = this.onOpen;
      this.socket.onmessage = this.onMessage;
      this.socket.onerror = this.onError;
      this.socket.onclose = this.onClose;
    } catch (error) {
      console.error(
        "WebSocketManager: Failed to initialize WebSocket (e.g., URL resolution error):",
        error,
      );
      this.socket = null;
      this.updateStatus(ConnectionStatus.Error);
      toast.error("Connection Initialization Failed", {
        description:
          "Could not configure the real-time connection. Please check settings.",
      });
    }
  }

  public disconnect() {
    // (Implementation remains as provided in context)
    this.intentionalDisconnect = true;
    this.cleanupReconnection();
    this.workflowId = null;

    if (this.socket) {
      console.log("WebSocketManager: Disconnecting...");
      this.socket.close(WS_CLOSE_CODE.NORMAL_CLOSURE);
      this.socket = null;
    }

    useStore.getState().resetWsState();
  }

  /**
   * Handler for successful connection (or reconnection).
   * Triggers synchronization (Architecture 5.3.2).
   */
  private onOpen = () => {
    console.log("WebSocketManager: Connection established.");
    this.reconnectAttempts = 0;
    this.updateStatus(ConnectionStatus.Connected);
    // CRITICAL: Enforce REST as Source of Truth upon connection (API 6.1.1)
    this.synchronizeWorkflowState();
  };

  /**
   * Handler for incoming messages. Includes logic to prevent race conditions during sync.
   */
  private onMessage = (event: MessageEvent) => {
    const { isLoading, isSyncing } = useStore.getState();
    // Prevent processing events while synchronization is in progress
    if (isLoading || isSyncing) {
      console.log("WebSocketManager: Ignoring message during synchronization.");
      return;
    }

    try {
      const payload = JSON.parse(event.data) as EventPayload;
      dispatchEvent(payload);
    } catch (error) {
      console.error(
        "WebSocketManager: Error processing message:",
        event.data,
        error,
      );
    }
  };

  private onError = (event: Event) => {
    console.error("WebSocketManager: Connection error:", event);
  };

  private onClose = (event: CloseEvent) => {
    // (Implementation remains as provided in context - handles cleanup and reconnection attempts)
    console.log(
      `WebSocketManager: Connection closed. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`,
    );

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket = null;
    }

    if (this.handleSpecificCloseCodes(event.code)) {
      return;
    }

    if (!this.intentionalDisconnect) {
      this.attemptReconnect();
    } else if (useStore.getState().wsStatus !== ConnectionStatus.Error) {
      this.updateStatus(ConnectionStatus.Disconnected);
    }
  };

  private handleSpecificCloseCodes(code: number): boolean {
    // (Implementation remains as provided in context - handles auth errors)
    switch (code) {
      case WS_CLOSE_CODE.NORMAL_CLOSURE:
        return false;

      case WS_CLOSE_CODE.AUTH_FAILED:
        console.error(
          "WebSocketManager: Authentication failed (4001). Logging out.",
        );
        this.intentionalDisconnect = true;
        this.updateStatus(ConnectionStatus.Error);
        useStore
          .getState()
          .logout(
            true,
            "WebSocket authentication failed. Please log in again.",
          );
        return true;

      case WS_CLOSE_CODE.AUTH_FORBIDDEN:
        console.error("WebSocketManager: Authorization failed (4003).");
        this.intentionalDisconnect = true;
        this.updateStatus(ConnectionStatus.Error);
        toast.error("Access Denied", {
          description:
            "You do not have permission to access this workflow.",
        });
        return true;

      default:
        return false;
    }
  }

  private attemptReconnect() {
    // (Implementation remains as provided in context - exponential backoff)
    if (this.intentionalDisconnect || this.reconnectTimeoutId) return;

    if (this.reconnectAttempts >= RECONNECT_CONFIG.MAX_ATTEMPTS) {
      console.error(
        "WebSocketManager: Maximum reconnection attempts reached. Giving up.",
      );
      toast.error("Connection Lost", {
        description:
          "Unable to re-establish real-time connection. Please check your network and refresh the page.",
        duration: 10000,
      });
      this.updateStatus(ConnectionStatus.Error);
      this.disconnect();
      return;
    }

    this.reconnectAttempts++;
    this.updateStatus(ConnectionStatus.Reconnecting);

    const delay = calculateBackoffDelay(
      this.reconnectAttempts,
      RECONNECT_CONFIG.BASE_DELAY,
      RECONNECT_CONFIG.MAX_DELAY,
    );

    console.log(
      `WebSocketManager: Attempting to reconnect (Attempt ${this.reconnectAttempts}) in ${delay}ms...`,
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.createSocketConnection();
    }, delay);
  }

  public async reconnect(immediate = false) {
    // (Implementation remains as provided in context)
    if (!this.workflowId) return;

    this.cleanupReconnection();

    if (this.socket) {
      const prevIntentional = this.intentionalDisconnect;
      this.intentionalDisconnect = true;
      this.socket.close(
        WS_CLOSE_CODE.NORMAL_CLOSURE,
        "Forced Reconnect (e.g. Token Refresh)",
      );
      this.intentionalDisconnect = prevIntentional;
    }

    this.updateStatus(ConnectionStatus.Reconnecting);

    if (!immediate) {
      await sleep(500);
    }

    this.reconnectAttempts = 0;
    this.createSocketConnection();
  }

  private cleanupReconnection() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  /**
   * Triggers a full workflow state synchronization using the REST API (Source of Truth).
   * (Architecture 5.3.2)
   */
  private synchronizeWorkflowState() {
    if (!this.workflowId) return;

    console.log(
      "WebSocketManager: Connection (re)established. Triggering full workflow synchronization (REST as Source of Truth)...",
    );
    // Call the store's loadWorkflow action. It handles setting 'isSyncing' state.
    useStore
      .getState()
      .loadWorkflow(this.workflowId)
      .catch((error) => {
        console.error(
          "WebSocketManager: Failed to synchronize state after reconnection:",
          error,
        );
        toast.error("Synchronization Failed", {
          description:
            "Could not synchronize workflow state. Data might be outdated.",
        });
      });
  }

  private updateStatus(status: ConnectionStatus) {
    // (Implementation remains as provided in context)
    const { isSubscribed } = useStore.getState();
    if (
      isSubscribed ||
      status === ConnectionStatus.Disconnected ||
      status === ConnectionStatus.Error
    ) {
      useStore.getState().setWsStatus(status);
    }
  }

  public destroy() {
    // (Implementation remains as provided in context)
    this.disconnect();
    if (this.tokenUnsubscribe) {
      this.tokenUnsubscribe();
      this.tokenUnsubscribe = null;
    }
  }
}

export const webSocketManager = new WebSocketManager();