import { type SliceCreator } from "~/core/store";

export enum ConnectionStatus {
  Disconnected = "DISCONNECTED",
  Connecting = "CONNECTING",
  Connected = "CONNECTED",
  Reconnecting = "RECONNECTING",
  Error = "ERROR",
}

export interface ConnectionStatusSlice {
  wsStatus: ConnectionStatus;
  isSubscribed: boolean;
  setWsStatus: (status: ConnectionStatus) => void;
  setSubscribed: (isSubscribed: boolean) => void;
  resetWsState: () => void;
}

export const createConnectionStatusSlice: SliceCreator<ConnectionStatusSlice> = (
  set,
) => ({
  wsStatus: ConnectionStatus.Disconnected,
  isSubscribed: false,

  setWsStatus: (status) => {
    set({ wsStatus: status });
  },

  setSubscribed: (isSubscribed) => {
    set({ isSubscribed });
  },

  resetWsState: () => {
    set({
      wsStatus: ConnectionStatus.Disconnected,
      isSubscribed: false,
    });
  },
});
