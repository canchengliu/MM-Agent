import { create } from "zustand";

interface ConnectionState {
  workflowId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  lastError: string | null;
  lastDisconnectCode: number | null;

  setConnecting: (workflowId: number) => void;
  setConnected: () => void;
  setReconnecting: () => void;
  setDisconnected: (payload?: { error?: string | null; code?: number | null }) => void;
  reset: () => void;
}

const INITIAL_STATE: Omit<
  ConnectionState,
  "setConnecting" | "setConnected" | "setReconnecting" | "setDisconnected" | "reset"
> = {
  workflowId: null,
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  lastError: null,
  lastDisconnectCode: null,
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  ...INITIAL_STATE,

  setConnecting: (workflowId) =>
    set({
      workflowId,
      isConnecting: true,
      isConnected: false,
      isReconnecting: false,
      lastError: null,
      lastDisconnectCode: null,
    }),

  setConnected: () =>
    set({
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      lastError: null,
      lastDisconnectCode: null,
    }),

  setReconnecting: () =>
    set({
      isReconnecting: true,
      isConnecting: false,
      isConnected: false,
    }),

  setDisconnected: (payload) =>
    set({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      lastError: payload?.error ?? null,
      lastDisconnectCode: payload?.code ?? null,
    }),

  reset: () => set({ ...INITIAL_STATE }),
}));
