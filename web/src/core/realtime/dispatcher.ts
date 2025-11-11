import type { ConnectionManager } from "./connection.manager";
import type { RealtimeEvent } from "./events.types";

/**
 * Thin wrapper around the WebSocket connection for publishing realtime events.
 */
export class RealtimeDispatcher {
  constructor(private readonly connection: ConnectionManager) {}

  dispatch(event: RealtimeEvent) {
    if (!this.connection.send(event)) {
      console.warn("[RealtimeDispatcher] Failed to send event.", event);
    }
  }
}
