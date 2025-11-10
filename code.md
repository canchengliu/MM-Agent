# Folder Structure of /Users/ann/Documents/projects/MM-Agent/web/src

## src
 - middleware.ts
 - navigation.ts
 - i18n.ts
 - env.js
 - i18n-config.ts

### env.js Content:

```js
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    AMPLITUDE_API_KEY: z.string().optional(),
    GITHUB_OAUTH_TOKEN: z.string().optional(),
    DEFAULT_TIME_ZONE: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string().optional(),
    NEXT_PUBLIC_STATIC_WEBSITE_ONLY: z.boolean().optional(),
    NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE: z.coerce.number().int().positive().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STATIC_WEBSITE_ONLY:
      process.env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY === "true",
    NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE: process.env.NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE,
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
    GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
    DEFAULT_TIME_ZONE: process.env.DEFAULT_TIME_ZONE,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

```

    ## core

        ## config
         - types.ts
         - index.ts

### core/config/types.ts Content:

```ts
export interface ModelConfig {
  basic: string[];
  reasoning: string[];
}

export interface RagConfig {
  provider: string;
}

export interface DeerFlowConfig {
  rag: RagConfig;
  models: ModelConfig;
}

```

### core/config/index.ts Content:

```ts
export * from "./types";

```

        ## auth
         - sessionEvents.ts
         - README.md
         - AuthProvider.tsx
         - hooks.ts

### core/auth/AuthProvider.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { clearToken, getToken, setToken } from "~/core/api/client";
import { AuthService } from "~/core/api/services/auth.service";
import { UserService } from "~/core/api/services/user.service";
import { subscribeToUnauthorized } from "~/core/auth/sessionEvents";
import type { UserRead } from "~/core/domain";

/**
 * Defines the shape of the authentication context provided to the app.
 */
interface AuthContextType {
  user: UserRead | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state and actions to its children.
 * Manages the user session lifecycle, including token validation and storage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  /**
   * Logs the user out, clears their session token, and purges all cached data.
   */
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
    queryClient.clear();
  }, [queryClient]);

  /**
   * Initializes the auth state on application load.
   * Checks for a stored token and validates it by fetching the user profile.
   */
  const initializeAuth = useCallback(async () => {
    const storedToken = getToken();
    if (storedToken) {
      try {
        const userData = await UserService.getMe();
        if (getToken()) {
          // Token might be cleared via logout while getMe is in-flight.
          setUser(userData);
        }
      } catch (error_) {
        console.error("Token validation failed, logging out.", error_);
        if (getToken()) {
          // Avoid redundant logout if a separate action already removed the token.
          logout();
        }
      }
    }
    setIsLoading(false);
  }, [logout]);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const unsubscribe = subscribeToUnauthorized(logout);
    return unsubscribe;
  }, [logout]);

  /**
   * Clears the authentication error state.
   * Useful for UI components to call when the user starts a new action.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Logs in a user, stores the new token, and fetches the user profile.
   * Handles login errors internally and updates the `error` state.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      clearError();
      try {
        const { access_token } = await AuthService.login(email, password);
        setToken(access_token);
        const userData = await UserService.getMe();
        setUser(userData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred during login.");
        }
      }
    },
    [clearError],
  );

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

```

### core/auth/hooks.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useContext } from "react";

import { AuthContext } from "./AuthProvider";

/**
 * Custom hook to access the authentication context.
 * @throws {Error} if used outside of an `AuthProvider`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

```

        ## markdown
         - katex.ts

        ## utils
         - json.ts
         - deep-clone.ts
         - markdown.ts
         - index.ts
         - time.ts

        ## mcp
         - schema.ts
         - types.ts
         - index.ts

### core/mcp/schema.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { z } from "zod";

export const MCPConfigSchema = z.object({
  mcpServers: z.record(
    z.union(
      [
        z.object({
          command: z.string({
            message: "`command` must be a string",
          }),
          args: z
            .array(z.string(), {
              message: "`args` must be an array of strings",
            })
            .optional(),
          env: z
            .record(z.string(), {
              message: "`env` must be an object of key-value pairs",
            })
            .optional(),
        }),
        z.object({
          url: z
            .string({
              message:
                "`url` must be a valid URL starting with http:// or https://",
            })
            .refine(
              (value) => {
                try {
                  const url = new URL(value);
                  return url.protocol === "http:" || url.protocol === "https:";
                } catch {
                  return false;
                }
              },
              {
                message:
                  "`url` must be a valid URL starting with http:// or https://",
              },
            ),
          env: z
            .record(z.string(), {
              message: "`env` must be an object of key-value pairs",
            })
            .optional(),
          transport: z
            .enum(["sse", "streamable_http"], {
              message: "transport must be either sse or streamable_http"
            })
            .default("sse"),
        }),
      ],
      {
        message: "Invalid server type",
      },
    ),
  ),
});

```

### core/mcp/types.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export interface MCPToolMetadata {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

export interface GenericMCPServerMetadata<T extends string> {
  name: string;
  transport: T;
  enabled: boolean;
  env?: Record<string, string>;
  headers?: Record<string, string>;
  tools: MCPToolMetadata[];
  createdAt: number;
  updatedAt: number;
}

export interface StdioMCPServerMetadata
  extends GenericMCPServerMetadata<"stdio"> {
  transport: "stdio";
  command: string;
  args?: string[];
}
export type SimpleStdioMCPServerMetadata = Omit<
  StdioMCPServerMetadata,
  "enabled" | "tools" | "createdAt" | "updatedAt"
>;

export interface SSEMCPServerMetadata
  extends GenericMCPServerMetadata<"sse" | "streamable_http"> {
  transport: "sse" | "streamable_http";
  url: string;
}

export type SimpleSSEMCPServerMetadata = Omit<
  SSEMCPServerMetadata,
  "enabled" | "tools" | "createdAt" | "updatedAt"
>;

export type MCPServerMetadata = StdioMCPServerMetadata | SSEMCPServerMetadata;
export type SimpleMCPServerMetadata =
  | SimpleStdioMCPServerMetadata
  | SimpleSSEMCPServerMetadata;

```

### core/mcp/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./schema";
export * from "./types";

```

        ## realtime
         - README.md
         - RealtimeProvider.tsx
         - connection.manager.ts
         - events.types.ts

### core/realtime/RealtimeProvider.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { getToken } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import type { WorkflowInstanceRead } from "~/core/domain";

import { connectionManager } from "./connection.manager";
import type {
  WSEventPayload,
  WSNodeStatusUpdatedPayload,
  WSWorkflowStatusUpdatedPayload,
  WSWorkflowStructureUpdatedPayload,
} from "./events.types";

interface RealtimeProviderProps {
  workflowId: number | null;
  children: ReactNode;
}

export function RealtimeProvider({
  workflowId,
  children,
}: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);
  const messageQueue = useRef<WSEventPayload[]>([]);

  const applyEventToCache = useCallback(
    (payload: WSEventPayload) => {
      if (!workflowId || payload.workflow_id !== workflowId) {
        return;
      }

      switch (payload.event_type) {
        case "NODE_STATUS_UPDATED": {
          const { node_id: nodeId, data: newNodeData } =
            payload as WSNodeStatusUpdatedPayload;
          console.log(`[WS] Applying NODE_STATUS_UPDATED for node ${nodeId}`);

          queryClient.setQueryData<WorkflowInstanceRead>(
            QueryKeys.workflow(workflowId),
            (oldData) => {
              if (!oldData) return oldData;
              const nodes = oldData.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...newNodeData } : node,
              );
              return { ...oldData, nodes };
            },
          );

          void queryClient.invalidateQueries({
            queryKey: QueryKeys.node(nodeId),
          });

          if (newNodeData.status === "Completed") {
            void queryClient.invalidateQueries({
              queryKey: QueryKeys.staleness(workflowId),
            });
          }
          break;
        }

        case "WORKFLOW_STRUCTURE_UPDATED": {
          console.log("[WS] Applying WORKFLOW_STRUCTURE_UPDATED");
          const { data: newWorkflowData } =
            payload as WSWorkflowStructureUpdatedPayload;
          toast.info("Macro-architecture generated!", {
            description: "New sub-tasks have been added to the workflow.",
          });
          queryClient.setQueryData(
            QueryKeys.workflow(workflowId),
            newWorkflowData,
          );
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.staleness(workflowId),
          });
          break;
        }

        case "WORKFLOW_STATUS_UPDATED": {
          console.log("[WS] Applying WORKFLOW_STATUS_UPDATED");
          const { data: newWorkflowData } =
            payload as WSWorkflowStatusUpdatedPayload;
          queryClient.setQueryData(
            QueryKeys.workflow(workflowId),
            newWorkflowData,
          );
          if (newWorkflowData.status === "Completed") {
            toast.success("Congratulations! The workflow has completed.");
          }
          break;
        }
        default:
          console.warn(`[WS] Unhandled event type: ${payload.event_type}`);
      }
    },
    [workflowId, queryClient],
  );

  const processQueue = useCallback(() => {
    const buffered = messageQueue.current;
    messageQueue.current = [];
    if (buffered.length > 0) {
      console.log(`[WS] Processing ${buffered.length} buffered messages.`);
      buffered.forEach(applyEventToCache);
    }
  }, [applyEventToCache]);

  const handleReconnect = useCallback(async () => {
    if (!workflowId || isSyncing.current) return;

    isSyncing.current = true;
    messageQueue.current = [];
    console.log("[WS] Reconnected. Starting state synchronization...");
    toast.info("Real-time connection restored. Syncing latest data...");

    try {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: QueryKeys.workflow(workflowId),
        }),
        queryClient.refetchQueries({
          queryKey: QueryKeys.staleness(workflowId),
        }),
      ]);
      console.log("[WS] State synchronization successful.");
    } catch (error) {
      console.error("[WS] State synchronization failed:", error);
      toast.error("Could not sync data after reconnecting.");
    } finally {
      isSyncing.current = false;
      console.log("[WS] Sync finished. Processing message queue...");
      processQueue();
    }
  }, [workflowId, queryClient, processQueue]);

  const handleMessage = useCallback(
    (payload: unknown) => {
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("event_type" in payload)
      ) {
        console.warn("[WS] Received malformed message:", payload);
        return;
      }

      const event = payload as WSEventPayload;

      if (isSyncing.current) {
        console.log(`[WS] Buffering message during sync: ${event.event_type}`);
        messageQueue.current.push(event);
      } else {
        applyEventToCache(event);
      }
    },
    [applyEventToCache],
  );

  useEffect(() => {
    const token = getToken();

    if (!workflowId || !token) {
      connectionManager.disconnect();
      return;
    }

    connectionManager.onReconnect(() => {
      void handleReconnect();
    });
    connectionManager.onMessage(handleMessage);
    connectionManager.connect(workflowId, token);

    return () => {
      connectionManager.disconnect();
    };
  }, [workflowId, handleReconnect, handleMessage]);

  return <>{children}</>;
}

```

### core/realtime/connection.manager.ts Content:

```ts
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
  const wsUrl = new URL(apiUrl);
  wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";

  const newPath = `${wsUrl.pathname.replace(/\/$/, "")}/ws/${workflowId}`;
  wsUrl.pathname = newPath;
  wsUrl.searchParams.set("token", token);

  return wsUrl.toString();
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

```

### core/realtime/events.types.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type {
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/domain";

/**
 * Union of all possible WebSocket event types from the server.
 * Derived from API Doc 6.4.
 */
export type WSEventType =
  | "NODE_STATUS_UPDATED"
  | "WORKFLOW_STRUCTURE_UPDATED"
  | "WORKFLOW_STATUS_UPDATED"
  | "ERROR";

/**
 * Generic structure for all incoming WebSocket messages.
 * Derived from API Doc 6.4.
 */
export interface WSEventPayload {
  event_type: WSEventType;
  workflow_id: number;
  node_id: number | null;
  data: unknown;
}

/**
 * Strongly typed payload for the 'NODE_STATUS_UPDATED' event (API Doc 6.5.1).
 */
export interface WSNodeStatusUpdatedPayload extends WSEventPayload {
  event_type: "NODE_STATUS_UPDATED";
  node_id: number;
  data: NodeInstanceRead;
}

/**
 * Strongly typed payload for the 'WORKFLOW_STRUCTURE_UPDATED' event (API Doc 6.5.2).
 */
export interface WSWorkflowStructureUpdatedPayload extends WSEventPayload {
  event_type: "WORKFLOW_STRUCTURE_UPDATED";
  data: WorkflowInstanceRead;
}

/**
 * Strongly typed payload for the 'WORKFLOW_STATUS_UPDATED' event (API Doc 6.5.3).
 */
export interface WSWorkflowStatusUpdatedPayload extends WSEventPayload {
  event_type: "WORKFLOW_STATUS_UPDATED";
  data: WorkflowInstanceRead;
}

```

        ## rehype
         - index.ts
         - rehype-split-words-into-spans.ts

        ## api
         - queryKeys.ts
         - client.ts

### core/api/queryKeys.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

// Placeholder for centralized TanStack Query keys.
export const QueryKeys = {
  userSettings: () => ["user", "settings"] as const,
  userInfo: () => ["user", "me"] as const,
  systemInfo: () => ["system", "info"] as const,

  // Project-related keys
  projects: () => ["projects"] as const,
  projectDetail: (projectId: number | null) =>
    ["projects", "detail", projectId ?? "unknown"] as const,
  historicalProblems: () =>
    ["projects", "historical-problems"] as const,

  // Workspace-related keys
  workflow: (workflowId: number | null) => ["workflows", workflowId] as const,
  staleness: (workflowId: number | null) =>
    ["workflows", workflowId, "staleness"] as const,
  node: (nodeId: number | null) => ["nodes", nodeId] as const,
  nodeVersions: (nodeId: number | null) =>
    ["nodes", nodeId, "versions"] as const,
  versionDetail: (nodeId: number | null, versionId: number | null) =>
    ["nodes", nodeId, "versions", versionId] as const,
} as const;

```

            ## services
             - node.service.ts
             - system.service.ts
             - project.service.ts
             - auth.service.ts
             - .gitkeep
             - user.service.ts
             - workflow.service.ts

### core/api/services/node.service.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";
import type {
  ExecutionRequest,
  HITLSubmission,
  HITLSubmissionResponse,
  ManualEditSubmission,
  NodeDetailView,
  NodeInstanceRead,
  NodeStateVersion,
  NodeVersionSummaryRead,
} from "~/core/domain";

/**
 * Service for handling individual node-level API endpoints.
 * Corresponds to API Doc 5.
 */
export const NodeService = {
  /**
   * Fetches the detailed information for a single node instance.
   * This is the core API for the Inspector panel and HITL views.
   * Corresponds to API Doc 5, Section 1.1.
   * @param nodeId The ID of the node to fetch.
   * @returns A promise resolving to the detailed node view.
   */
  getDetail: (nodeId: number): Promise<NodeDetailView> => {
    return apiClient<NodeDetailView>(`/nodes/${nodeId}`);
  },

  /**
   * Fetches the list of all historical versions for a given node.
   * Corresponds to API Doc 5, Section 1.2.
   * @param nodeId The ID of the node.
   * @returns A promise resolving to an array of version summaries.
   */
  getVersions: (nodeId: number): Promise<NodeVersionSummaryRead[]> => {
    return apiClient<NodeVersionSummaryRead[]>(`/nodes/${nodeId}/versions`);
  },

  /**
   * Fetches the complete snapshot for a specific historical version of a node.
   * Corresponds to API Doc 5, Section 1.3.
   * @param nodeId The ID of the parent node.
   * @param versionId The ID of the version to fetch.
   * @returns A promise resolving to the full node state version.
   */
  getVersionDetail: (
    nodeId: number,
    versionId: number,
  ): Promise<NodeStateVersion> => {
    return apiClient<NodeStateVersion>(
      `/nodes/${nodeId}/versions/${versionId}`,
    );
  },

  /**
   * Activates a historical version for a node.
   * Corresponds to API Doc 5, Section 4.2.
   * @param nodeId The ID of the parent node.
   * @param versionId The ID of the version to activate.
   * @returns A promise resolving to the updated node instance.
   */
  activateVersion: (
    nodeId: number,
    versionId: number,
  ): Promise<NodeInstanceRead> => {
    return apiClient<NodeInstanceRead>(
      `/nodes/${nodeId}/versions/${versionId}/activate`,
      {
        method: "POST",
      },
    );
  },

  /**
   * Submits a user-provided manual edit for a node, creating a new version.
   * Corresponds to API Doc 5, Section 4.1.
   * @param nodeId The ID of the node to edit.
   * @param payload The manual edit submission data.
   * @returns A promise resolving to the updated node instance.
   */
  manualEdit: (
    nodeId: number,
    payload: ManualEditSubmission,
  ): Promise<NodeInstanceRead> => {
    return apiClient<NodeInstanceRead>(`/nodes/${nodeId}/manual-edit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Submits a user's decision for a node awaiting HITL approval.
   * This is the core of human-in-the-loop interaction.
   * Corresponds to API Doc 5, Section 3.
   * @param nodeId The ID of the node to submit the decision for.
   * @param payload The HITL submission data.
   * @returns A promise resolving to the action response from the backend.
   */
  submitHITL: (
    nodeId: number,
    payload: HITLSubmission,
  ): Promise<HITLSubmissionResponse> => {
    return apiClient<HITLSubmissionResponse>(`/nodes/${nodeId}/hitl`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Triggers a re-execution of a completed node.
   * Corresponds to API Doc 5, Section 2.1.
   * @param nodeId The ID of the node to re-execute.
   * @param payload The execution request details.
   * @returns A promise resolving to the acceptance message.
   */
  reExecute: (
    nodeId: number,
    payload: ExecutionRequest,
  ): Promise<{ message: string; node_id: number }> => {
    return apiClient(`/nodes/${nodeId}/re-execute`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Triggers a retry of a failed node.
   * Corresponds to API Doc 5, Section 2.2.
   * @param nodeId The ID of the node to retry.
   * @param payload The execution request details.
   * @returns A promise resolving to the acceptance message.
   */
  retry: (
    nodeId: number,
    payload: ExecutionRequest,
  ): Promise<{ message: string; node_id: number }> => {
    return apiClient(`/nodes/${nodeId}/retry`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

```

### core/api/services/system.service.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";

/**
 * Represents static metadata about the backend application.
 * @see API Doc 7, Section 3 `GET /system/info`.
 */
export interface SystemInfo {
  app_version: string;
  llm_model_name: string;
  commit_hash?: string;
  build_timestamp?: string;
  documentation_url?: string;
  feature_flags?: Record<string, boolean>;
}

export const SystemService = {
  /**
   * Fetches build-time metadata for display in the About tab.
   */
  getInfo: (): Promise<SystemInfo> => {
    return apiClient<SystemInfo>("/system/info");
  },
};

```

### core/api/services/project.service.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";
import type {
  FileRole,
  HistoricalProblem,
  ProjectDetailRead,
  ProjectFileRead,
  ProjectProblemType,
  ProjectSummaryRead,
  WorkflowStartResponse,
} from "~/core/domain";

/**
 * Payload for creating a new project.
 * Based on API Doc 3, Section 1.1 `POST /projects/`.
 */
export interface ProjectCreate {
  name: string;
  description?: string;
}

/**
 * Payload for updating a project's details.
 * Based on API Doc 3, Section 1.4 `PATCH /projects/{project_id}`.
 */
export interface ProjectUpdate {
  name?: string;
  description?: string;
  problem_type?: ProjectProblemType;
}

/**
 * Payload for initializing a project from the historical library.
 * Based on API Doc 3, Section 2.2 `POST /projects/{project_id}/initialize-from-historical`.
 */
export interface HistoricalInitializationRequest {
  historical_problem_id: number;
}

/**
 * Structure for paginated project list responses.
 * Based on API Doc 3, Section 1.2 `GET /projects/`.
 */
export interface PaginatedProjects {
  total: number;
  items: ProjectSummaryRead[];
}

/**
 * Service for handling project management API endpoints.
 */
export const ProjectService = {
  /**
   * Creates a new project for the current user.
   * Corresponds to API Doc 3, Section 1.1.
   */
  create: (payload: ProjectCreate): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>("/projects/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieves a paginated list of projects for the current user.
   * Corresponds to API Doc 3, Section 1.2.
   */
  getList: (
    params: {
      skip?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedProjects> => {
    const searchParams = new URLSearchParams();
    if (typeof params.skip === "number") {
      searchParams.set("skip", params.skip.toString());
    }
    if (typeof params.limit === "number") {
      searchParams.set("limit", params.limit.toString());
    }

    const queryString = searchParams.toString();
    const suffix = queryString ? `?${queryString}` : "";
    return apiClient<PaginatedProjects>(`/projects/${suffix}`);
  },

  /**
   * Fetches the detailed information for a single project.
   * Corresponds to API Doc 3, Section 1.3.
   */
  getDetail: (projectId: number): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>(`/projects/${projectId}`);
  },

  /**
   * Updates a project's name, description, or problem type.
   * Corresponds to API Doc 3, Section 1.4.
   */
  update: (
    projectId: number,
    payload: ProjectUpdate,
  ): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Permanently deletes a project and all its associated data.
   * Corresponds to API Doc 3, Section 1.5.
   */
  delete: (projectId: number): Promise<void> => {
    return apiClient<void>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  /**
   * Uploads a file and associates it with a project.
   * Corresponds to API Doc 3, Section 2.1.
   */
  uploadFile: (
    projectId: number,
    file: File,
    role: FileRole,
  ): Promise<ProjectFileRead> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    return apiClient<ProjectFileRead>(`/projects/${projectId}/files`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Initializes a project using data from a historical problem.
   * Corresponds to API Doc 3, Section 2.2.
   */
  initializeFromHistorical: (
    projectId: number,
    payload: HistoricalInitializationRequest,
  ): Promise<ProjectDetailRead> => {
    return apiClient<ProjectDetailRead>(
      `/projects/${projectId}/initialize-from-historical`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  /**
   * Starts the workflow for a configured project.
   * Corresponds to API Doc 3, Section 3.1.
   */
  startWorkflow: (projectId: number): Promise<WorkflowStartResponse> => {
    return apiClient<WorkflowStartResponse>(`/projects/${projectId}/start`, {
      method: "POST",
    });
  },

  /**
   * Exports all project artifacts as a ZIP file.
   * Corresponds to API Doc 3, Section 3.2.
   */
  exportProject: (projectId: number): Promise<Blob> => {
    return apiClient<Blob>(`/projects/${projectId}/export`);
  },

  /**
   * Fetches the list of available historical problems.
   * Corresponds to API Doc 3, Section 4.1.
   */
  getHistoricalProblems: (): Promise<HistoricalProblem[]> => {
    return apiClient<HistoricalProblem[]>("/historical-problems");
  },
};

```

### core/api/services/auth.service.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { UserRead } from "~/core/domain";

import { apiClient, authApiClient } from "../client";

/**
 * Payload for creating a new user account.
 * Mirrors API Doc 1, Section 2.1.
 */
interface RegisterPayload {
  email: string;
  password: string;
  display_name?: string;
}

/**
 * Service for handling user authentication API endpoints.
 */
export const AuthService = {
  /**
   * Logs in a user using email and password.
   * This uses the specialized authApiClient for `application/x-www-form-urlencoded` requests.
   * @param username - The user's email address.
   * @param password - The user's password.
   * @returns A promise resolving to the access token and token type.
   */
  login: (
    username: string,
    password: string,
  ): Promise<{ access_token: string; token_type: "bearer" }> => {
    return authApiClient.login(username, password);
  },

  /**
   * Registers a new user account.
   * @param payload - The user registration data.
   * @returns A promise resolving to the newly created user's data.
   */
  register: (payload: RegisterPayload): Promise<UserRead> => {
    return apiClient<UserRead>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

```

### core/api/services/user.service.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type {
  UserRead,
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/domain";

import { apiClient } from "../client";

/**
 * Service for handling user profile related API endpoints.
 */
export const UserService = {
  /**
   * Fetches the profile of the currently authenticated user.
   * This is the primary method for validating an existing session token.
   * @returns A promise resolving to the current user's data.
   */
  getMe: (): Promise<UserRead> => {
    return apiClient<UserRead>("/users/me", {
      method: "GET",
    });
  },

  /**
   * Fetches the personalized settings of the currently authenticated user.
   * @returns A promise resolving to the user's settings.
   */
  getSettings: (): Promise<UserSettingsRead> => {
    return apiClient<UserSettingsRead>("/users/me/settings", {
      method: "GET",
    });
  },

  /**
   * Partially updates settings for the current user.
   * @param settings - Settings payload containing changed fields only.
   * @returns Updated user settings from the server.
   */
  updateSettings: (
    settings: Partial<UserSettingsUpdate>,
  ): Promise<UserSettingsRead> => {
    return apiClient<UserSettingsRead>("/users/me/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
  },
};

```

### core/api/services/workflow.service.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { apiClient } from "~/core/api/client";
import type { StalenessReport, WorkflowInstanceRead } from "~/core/domain";

/**
 * Service for handling workflow-level API endpoints.
 * Corresponds to API Doc 4.
 */
export const WorkflowService = {
  /**
   * Fetches the detailed information for a single workflow, including all nodes.
   * This is the core API for loading the workspace canvas.
   * Corresponds to API Doc 4, Section 2.1.
   * @param workflowId The ID of the workflow to fetch.
   * @returns A promise resolving to the full workflow instance.
   */
  getDetail: (workflowId: number): Promise<WorkflowInstanceRead> => {
    return apiClient<WorkflowInstanceRead>(`/workflows/${workflowId}`);
  },

  /**
   * Fetches the staleness report for all nodes within a workflow.
   * Corresponds to API Doc 4, Section 3.1.
   * @param workflowId The ID of the workflow to check.
   * @returns A promise resolving to the staleness report object.
   */
  getStaleness: (workflowId: number): Promise<StalenessReport> => {
    return apiClient<StalenessReport>(`/workflows/${workflowId}/staleness`);
  },
};

```

        ## replay
         - get-replay-id.ts
         - index.ts
         - hooks.ts

### core/replay/get-replay-id.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export function extractReplayIdFromSearchParams(params: string) {
  const urlParams = new URLSearchParams(params);
  if (urlParams.has("replay")) {
    return urlParams.get("replay");
  }
  return null;
}

```

### core/replay/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./hooks";

```

### core/replay/hooks.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { env } from "~/env";

import { extractReplayIdFromSearchParams } from "./get-replay-id";

export function useReplay() {
  const searchParams = useSearchParams();
  const replayId = useMemo(
    () => extractReplayIdFromSearchParams(searchParams.toString()),
    [searchParams],
  );
  return {
    isReplay: replayId != null || env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY,
    replayId,
  };
}

```

        ## domain
         - workflow.types.ts
         - README.md
         - project.types.ts
         - index.ts
         - version.types.ts
         - node.types.ts
         - user.types.ts

### core/domain/workflow.types.ts Content:

```ts
import type { NodeInstanceRead } from "./node.types";

/**
 * Represents the overall status of a workflow instance.
 * From API Doc 4, "Workflow Status" concept.
 */
export type WorkflowStatus = "Running" | "Completed";

/**
 * OPTIMIZATION: Centralized definition for dependency staleness.
 * Represents the staleness information for a single upstream dependency,
 * used in both workflow-level and node-level reports.
 * Based on API Doc 4.3.1 and 5.1.1.
 */
export interface StalenessInfo {
  upstream_node_id: number;
  upstream_definition_id: string;
  consumed_version_id: number;
  current_active_version_id: number;
}

/**
 * A mapping of node IDs to their staleness reasons.
 * Based on API Doc 4, Section 3.1 `GET /workflows/{workflow_id}/staleness`.
 */
export type StalenessReport = Record<string, StalenessInfo[]>;

/**
 * Represents a summary view of a workflow instance.
 * Based on API Doc 4, Section 1.2 `GET /workflows/`.
 */
export interface WorkflowSummaryRead {
  id: number;
  name: string;
  status: WorkflowStatus;
  project_id: number;
  user_id: number;
  created_at: string; // ISO 8601 date string
}

/**
 * Represents the complete detailed information of a single workflow instance,
 * including all its nodes. This is the core data for the canvas.
 * Based on API Doc 4, Section 2.1 `GET /workflows/{workflow_id}`.
 */
export interface WorkflowInstanceRead extends WorkflowSummaryRead {
  nodes: NodeInstanceRead[];
}

```

### core/domain/project.types.ts Content:

```ts
import type { NodeInstanceRead } from "./node.types";

/**
 * Represents the lifecycle status of a project.
 * From API Doc 3, "Project Lifecycle" concept.
 */
export type ProjectStatus = "Configuring" | "Running" | "Completed";

/**
 * Defines the role of a file within a project.
 * From API Doc 3, Section 2.1 `POST /projects/{project_id}/files`.
 */
export type FileRole =
  | "Problem Description"
  | "Dataset"
  | "Reference Material";

/**
 * Represents the type of problem a project is addressing.
 * From API Doc 3, Section 1.4 `PATCH /projects/{project_id}`.
 */
export type ProjectProblemType = "A" | "B" | "C" | "D" | "E" | "F" | "-";

/**
 * Represents a file uploaded to a project.
 * Based on API Doc 3, Section 2.1 `POST /projects/{project_id}/files` success response.
 */
export interface ProjectFileRead {
  id: number;
  filename: string;
  role: FileRole;
  created_at: string; // ISO 8601 date string
}

/**
 * Represents a summary view of a project, suitable for list displays.
 * Based on API Doc 3, Section 1.2 `GET /projects/`.
 */
export interface ProjectSummaryRead {
  id: number;
  name: string;
  status: ProjectStatus;
  problem_type: ProjectProblemType;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  workflow_instance_id: number | null;
}

/**
 * Represents the complete detailed information of a single project.
 * Based on API Doc 3, Section 1.3 `GET /projects/{project_id}`.
 */
export interface ProjectDetailRead {
  id: number;
  name: string;
  status: ProjectStatus;
  problem_type: ProjectProblemType;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  workflow_instance_id: number | null;
  description: string | null;
  files: ProjectFileRead[];
  historical_problem_id: number | null;
}

/**
 * Represents an item from the historical problem library.
 * Based on API Doc 3, Section 4.1 `GET /historical-problems`.
 */
export interface HistoricalProblem {
  id: number;
  year: number;
  type: ProjectProblemType;
  name: string;
  has_dataset: boolean;
}

/**
 * Represents the first node instance created when a workflow starts.
 * Based on API Doc 3, Section 3.1 `POST /projects/{project_id}/start`.
 */
export type WorkflowStartResponse = NodeInstanceRead;

```

### core/domain/index.ts Content:

```ts
export * from "./user.types";
export * from "./project.types";
export * from "./workflow.types";
export * from "./node.types";
export * from "./version.types";

```

### core/domain/version.types.ts Content:

```ts
import type { HITLMode } from "./node.types";

/**
 * OPTIMIZATION: Defines the set of version sources strictly defined by the backend API.
 * From API Doc 5, Section 1.2 `GET /nodes/{node_id}/versions`.
 */
export type VersionSourceFromAPI = "AI_GENERATED" | "MANUALLY_EDITED";

/**
 * OPTIMIZATION: Defines an enriched set of version sources for richer frontend context.
 * It includes API values plus additional states from the design document for better traceability.
 * From Design Doc 2.1.5.
 */
export type VersionSource =
  | VersionSourceFromAPI
  | "AI_INITIAL"
  | "HITL_REFINED";

/**
 * Represents a detailed user interaction record during a node's execution.
 * Part of a `NodeStateVersion`, capturing the "why" behind a decision.
 * Based on Design Doc 2.1.2.
 */
export interface HITLRecord {
  interaction_type: HITLMode;
  timestamp: string; // ISO 8601 date string
  user_input: Record<string, unknown>;
  llm_response: unknown;
}

/**
 * Represents a summary view of a historical node version.
 * Based on API Doc 5, Section 1.2 `GET /nodes/{node_id}/versions`.
 */
export interface NodeVersionSummaryRead {
  id: number;
  version_number: number;
  node_instance_id: number;
  summary: string | null;
  source: VersionSource;
  based_on_version_id: number | null;
  created_at: string; // ISO 8601 date string
}

/**
 * Represents an immutable, atomic snapshot of a node's state at a point in time.
 * This is the core "Result State" concept.
 * Based on Design Doc 2.1.2 and implied by `NodeDetailView.active_version`
 * and the response from `GET /nodes/{id}/versions/{vid}`.
 */
export interface NodeStateVersion extends NodeVersionSummaryRead {
  /**
   * Records the exact upstream version IDs this version was based on.
   * e.g., `{"<upstream_node_id>": <version_id>}`
   */
  input_versions: Record<string, number>;
  /**
   * The final, structured JSON output of this version.
   */
  output_data: Record<string, unknown>;
  /**
   * A complete log of Human-in-the-Loop interactions that led to this version.
   */
  hitl_records: HITLRecord[];
  /**
   * A snapshot of environmental parameters at the time of execution.
   */
  environment_params: Record<string, unknown>;
  /**
   * The creation timestamp of this version.
   */
  created_at: string; // ISO 8601 date string
}

```

### core/domain/node.types.ts Content:

```ts
import type { NodeStateVersion, HITLRecord } from "./version.types";
import type { StalenessInfo } from "./workflow.types";

/**
 * Represents the lifecycle status of a node instance.
 * From API Doc 5, "Node Lifecycle" concept.
 */
export type NodeStatus =
  | "Not Started"
  | "Executing"
  | "Awaiting HITL Approval"
  | "Completed"
  | "Failed";

/**
 * Defines the type of a node, influencing system behavior.
 * `Generator` nodes can dynamically alter the workflow structure.
 * From Design Doc 2.1.5, API Doc 5, Section 1.1 `NodeDetailView`.
 */
export type NodeType = "Standard" | "Generator";

/**
 * Defines the Human-in-the-Loop interaction pattern for a node.
 * From Design Doc 2.1.5, API Doc 5, Section 1.1 `NodeDetailView`.
 */
export type HITLMode = "VARL" | "SCA" | "AVL";

/**
 * Represents a summary view of a node instance within a workflow.
 * Based on API Doc 3, Section 3.1 `POST /projects/{id}/start` response,
 * which returns a `NodeInstanceRead`.
 */
export interface NodeInstanceRead {
  id: number;
  definition_id: string;
  name: string;
  status: NodeStatus;
  current_stage: string;
  node_type: NodeType;
  hitl_mode: HITLMode;
  order_index: number;
  active_version_id: number | null;
  phase_id: string;
  task_group_id: string | null;
}

/**
 * The payload for re-executing or retrying a node.
 * From API Doc 5, Section 2.1 & 2.2.
 */
export interface ExecutionRequest {
  modification_comments?: string | null;
  base_version_id?: number | null;
}

/**
 * The payload for submitting a HITL decision.
 * From API Doc 5, Section 3.
 */
export interface HITLSubmission {
  action: "Continue" | "RejectAndProvideModificationComments" | "Discard";
  feedback_comment?: string | null;
  interaction_data?: Record<string, unknown> | null;
}

/**
 * The payload for submitting a manual edit to a node.
 * From API Doc 5, Section 4.1.
 */
export interface ManualEditSubmission {
  base_version_id: number;
  edited_output_data: Record<string, unknown>;
  summary?: string;
}

/**
 * The response from a successful HITL submission.
 * From API Doc 5, Section 3.
 */
export interface HITLSubmissionResponse {
  message: string;
  next_node_id: number | null;
  action:
    | "ExecuteNext"
    | "NavigateNext"
    | "Completed"
    | "AVLLoop"
    | "ReExecute"
    | "Discarded";
}

/**
 * Represents the temporary result of a node's execution that is
 * either in-progress or awaiting user approval (HITL).
 * This corresponds to the `ExecutionTrace` concept's output.
 * From API Doc 5, Section 1.1 `pending_result` field.
 */
export interface PendingExecutionResult {
  output_data: Record<string, unknown>;
  /**
   * OPTIMIZATION: Replaced `any[]` with a specific type for improved type safety,
   * assuming the structure is consistent with the final `HITLRecord`.
   */
  accumulated_hitl_interactions: HITLRecord[];
  error_log: string | null;
}

/**
 * Represents the complete detailed information of a single node instance.
 * This is the primary data source for the Inspector and HITL views.
 * Based on API Doc 5, Section 1.1 `GET /nodes/{node_id}`.
 */
export interface NodeDetailView extends NodeInstanceRead {
  active_version: NodeStateVersion | null;
  pending_result: PendingExecutionResult | null;
  /**
   * OPTIMIZATION: Now uses the centralized `StalenessInfo` type.
   */
  staleness_report: StalenessInfo[] | null;
}

```

### core/domain/user.types.ts Content:

```ts
/**
 * Represents the core identity information of a user.
 * Based on API Doc 2, Section 1.1 `GET /users/me`.
 */
export interface UserRead {
  id: number;
  email: string;
  display_name: string;
  is_active: boolean;
  is_verified: boolean;
}

/**
 * Application UI theme options.
 * From API Doc 2, Section 2.2 `UserSettingsUpdate`.
 */
export type Theme = "light" | "dark";

/**
 * AI behavior profile in Human-in-the-Loop interactions.
 * From API Doc 2, Section 2.2 `UserSettingsUpdate`.
 */
export type HITLProfile = "Novice" | "Experienced" | "Expert";

/**
 * AI thinking depth, affecting response time and complexity.
 * From API Doc 2, Section 2.2 `UserSettingsUpdate`.
 */
export type ThinkingDepth = "Instant" | "Medium" | "Heavy";

/**
 * Represents the complete personalized settings for a user.
 * Based on API Doc 2, Section 2.1 `GET /users/me/settings`.
 */
export interface UserSettingsRead {
  language: "en" | "zh";
  theme: Theme;
  hitl_profile: HITLProfile;
  thinking_depth: ThinkingDepth;
  llm_model_name: string | null;
  llm_base_url: string | null;
  has_llm_api_key: boolean;
  has_e2b_api_key: boolean;
}

/**
 * Represents the updatable fields for a user's settings.
 */
export interface UserSettingsUpdate {
  language?: "en" | "zh";
  theme?: Theme;
  hitl_profile?: HITLProfile;
  thinking_depth?: ThinkingDepth;
  llm_model_name?: string | null;
  llm_base_url?: string | null;
  llm_api_key?: string | null;
  e2b_api_key?: string | null;
}

```

        ## store
         - index.ts
         - workspace.store.ts

### core/store/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./workspace.store";

```

### core/store/workspace.store.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Defines the view modes for the central canvas.
 * 'ExecutionGraph': The default live view of the workflow (Screen 1).
 * 'HistoryGraph': The complete historical provenance view (Screen 2).
 */
export type ViewMode = "ExecutionGraph" | "HistoryGraph";

/**
 * Defines the state and actions for managing the Cognitive Cockpit's UI.
 * This store is responsible for client-side state only, such as user focus and layout preferences.
 * It is intentionally separated from server state, which is managed by TanStack Query.
 */
export interface WorkspaceState {
  // --- Focus Management ---
  // The single source of truth for which part of the workspace the user is interacting with.

  /**
   * The ID of the node currently selected in the Navigator or Canvas.
   * Null if no node is focused.
   */
  focusedNodeId: number | null;
  /**
   * The ID of a specific historical version being reviewed in "Time Travel Mode".
   * Null if not in time travel mode.
   */
  inspectedVersionId: number | null;
  /**
   * The ID of the node currently being manually edited.
   * Null when not in manual edit mode.
   */
  editingNodeId: number | null;

  // --- View State ---
  // Controls which major visualization is active in the central canvas.

  /** The current view mode for the main canvas. */
  viewMode: ViewMode;

  // --- Layout Preferences ---
  // Persisted state to remember the user's preferred panel arrangement.

  /**
   * Dimensions and collapsed states of the resizable panels.
   * This part of the state is persisted to localStorage.
   */
  layout: {
    navigatorWidth: number;
    inspectorWidth: number;
    isNavigatorCollapsed: boolean;
    isInspectorCollapsed: boolean;
  };

  // --- Actions ---
  // Functions to manipulate the UI state.

  /**
   * Sets the focus to a specific node.
   * @param nodeId The ID of the node to focus, or null to clear focus.
   * @importantly This action also resets any active historical version inspection.
   */
  focusNode: (nodeId: number | null) => void;
  /**
   * Enters or exits "Time Travel Mode" by focusing on a specific historical version.
   * @param versionId The ID of the version to inspect, or null to exit the mode.
   */
  inspectVersion: (versionId: number | null) => void;
  /**
   * Enters manual edit mode for a node.
   * @param nodeId The ID of the node to edit.
   */
  startEditingNode: (nodeId: number) => void;
  /**
   * Exits manual edit mode.
   */
  stopEditingNode: () => void;
  /**
   * Switches the central canvas between the live execution graph and the history graph.
   * @param mode The view mode to activate.
   */
  setViewMode: (mode: ViewMode) => void;
  /**
   * Updates the persisted layout preferences.
   * @param updates A partial object of the layout state to update.
   */
  updateLayout: (updates: Partial<WorkspaceState["layout"]>) => void;
}

/**
 * Zustand store for the workspace UI state, with persistence for layout settings.
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      // --- Initial State ---
      focusedNodeId: null,
      inspectedVersionId: null,
      editingNodeId: null,
      viewMode: "ExecutionGraph",
      layout: {
        navigatorWidth: 25,
        inspectorWidth: 30,
        isNavigatorCollapsed: false,
        isInspectorCollapsed: false,
      },

      // --- Actions Implementation ---
      focusNode: (nodeId) =>
        set({
          focusedNodeId: nodeId,
          // CRUCIAL: Resetting inspection ensures the user is viewing the active
          // state of the newly focused node, not a historical version of a previous one.
          inspectedVersionId: null,
          editingNodeId: null,
        }),

      inspectVersion: (versionId) =>
        set((state) => ({
          inspectedVersionId: versionId,
          editingNodeId: versionId ? null : state.editingNodeId,
        })),

      startEditingNode: (nodeId) =>
        set({
          editingNodeId: nodeId,
          focusedNodeId: nodeId,
          inspectedVersionId: null,
        }),

      stopEditingNode: () => set({ editingNodeId: null }),

      setViewMode: (mode) => set({ viewMode: mode }),

      updateLayout: (updates) =>
        set((state) => ({
          layout: { ...state.layout, ...updates },
        })),
    }),
    {
      // The key used to store the data in localStorage.
      name: "workspace-layout-storage",
      // Optimization: Only persist the 'layout' part of the state.
      // Focus and view mode are transient and should reset on page load to ensure
      // a clean starting context for the user. This prevents saving a "stale" UI focus.
      partialize: (state) => ({ layout: state.layout }),
    },
  ),
);

```

    ## app
     - layout.tsx

### app/layout.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import "~/styles/globals.css";

import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Script from "next/script";
import { getLocale, getMessages } from "next-intl/server";

import { AppProviders } from "~/components/AppProviders";
import { ThemeProviderWrapper } from "~/components/deer-flow/theme-provider-wrapper";
import { env } from "~/env";

import { Toaster } from "../components/deer-flow/toaster";

export const metadata: Metadata = {
  title: "Cognitive Cockpit",
  description:
    "An AI-native collaborative environment for complex research and analysis.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  return (
    <html
      lang={locale}
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Define isSpace function globally to fix markdown-it issues with Next.js + Turbopack
          https://github.com/markdown-it/markdown-it/issues/1082#issuecomment-2749656365 */}
        <Script id="markdown-it-fix" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined' && typeof window.isSpace === 'undefined') {
              window.isSpace = function(code) {
                return code === 0x20 || code === 0x09 || code === 0x0A || code === 0x0B || code === 0x0C || code === 0x0D;
              };
            }
          `}
        </Script>
      </head>
      <body className="bg-app">
        <AppProviders locale={locale} messages={messages}>
          <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
          <Toaster />
        </AppProviders>
        {
          // NO USER BEHAVIOR TRACKING OR PRIVATE DATA COLLECTION BY DEFAULT
          //
          // When `NEXT_PUBLIC_STATIC_WEBSITE_ONLY` is `true`, the script will be injected
          // into the page only when `AMPLITUDE_API_KEY` is provided in `.env`
        }
        {env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY && env.AMPLITUDE_API_KEY && (
          <>
            <Script src="https://cdn.amplitude.com/script/d2197dd1df3f2959f26295bb0e7e849f.js"></Script>
            <Script id="amplitude-init" strategy="lazyOnload">
              {`window.amplitude.init('${env.AMPLITUDE_API_KEY}', {"fetchRemoteConfig":true,"autocapture":true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

```

        ## [locale]
         - layout.tsx
         - page.tsx

### app/[locale]/page.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useTranslations } from 'next-intl';
import { useMemo } from "react";

import { Jumbotron } from "./landing/components/jumbotron";
import { Ray } from "./landing/components/ray";
import { SiteHeader } from "./landing/components/site-header";
import { CaseStudySection } from "./landing/sections/case-study-section";
import { CoreFeatureSection } from "./landing/sections/core-features-section";
import { JoinCommunitySection } from "./landing/sections/join-community-section";
import { MultiAgentSection } from "./landing/sections/multi-agent-section";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <SiteHeader />
      <main className="container flex flex-col items-center justify-center gap-56">
        <Jumbotron />
        <CaseStudySection />
        <MultiAgentSection />
        <CoreFeatureSection />
        <JoinCommunitySection />
      </main>
      <Footer />
      <Ray />
    </div>
  );
}
function Footer() {
  const t = useTranslations('footer');
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="container mt-32 flex flex-col items-center justify-center">
      <hr className="from-border/0 via-border/70 to-border/0 m-0 h-px w-full border-none bg-gradient-to-r" />
      <div className="text-muted-foreground container flex h-20 flex-col items-center justify-center text-sm">
        <p className="text-center font-serif text-lg md:text-xl">
          &quot;{t('quote')}&quot;
        </p>
      </div>
      <div className="text-muted-foreground container mb-8 flex flex-col items-center justify-center text-xs">
        <p>{t('license')}</p>
        <p>&copy; {year} {t('copyright')}</p>
      </div>
    </footer>
  );
}

```

            ## landing

                ## sections
                 - join-community-section.tsx
                 - case-study-section.tsx
                 - core-features-section.tsx
                 - multi-agent-section.tsx

### app/[locale]/landing/sections/join-community-section.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { GithubFilled } from "@ant-design/icons";
import { useTranslations } from "next-intl";

import { AuroraText } from "~/components/magicui/aurora-text";
import { Button } from "~/components/ui/button";

import { SectionHeader } from "../components/section-header";
import { Link } from "~/navigation";

export function JoinCommunitySection() {
  const t = useTranslations("landing.joinCommunity");
  return (
    <section className="flex w-full flex-col items-center justify-center pb-12">
      <SectionHeader
        anchor="join-community"
        title={
          <AuroraText colors={["#60A5FA", "#A5FA60", "#A560FA"]}>
            {t("title")}
          </AuroraText>
        }
        description={t("description")}
      />
      <Button className="text-xl" size="lg" asChild>
        <Link href="https://github.com/bytedance/deer-flow" target="_blank">
          <GithubFilled />
          {t("contributeNow")}
        </Link>
      </Button>
    </section>
  );
}

```

### app/[locale]/landing/sections/case-study-section.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  BarChart,
  Bot,
  LineChart,
  Network,
  Plane,
  Sigma,
  Target,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { BentoCard } from "~/components/magicui/bento-grid";

import { SectionHeader } from "../components/section-header";

const caseStudyIcons = [
  { id: "operations-research-logistics", icon: Network },
  { id: "epidemic-modeling-sir", icon: BarChart },
  { id: "financial-portfolio-optimization", icon: LineChart },
  { id: "game-theory-pricing-strategy", icon: Target },
  { id: "aerospace-trajectory-optimization", icon: Plane },
  { id: "machine-learning-model-selection", icon: Bot },
  { id: "differential-equations-predator-prey", icon: Sigma },
];

export function CaseStudySection() {
  const t = useTranslations("landing.caseStudies");
  const cases = t.raw("cases") as Array<{ title: string; description: string }>;

  return (
    <section className="relative container hidden flex-col items-center justify-center md:flex">
      <SectionHeader
        anchor="case-studies"
        title={t("title")}
        description={t("description")}
      />
      <div className="grid w-3/4 grid-cols-1 gap-2 sm:w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cases.map((caseStudy, index) => {
          const iconData = caseStudyIcons[index];
          if (!iconData) return null;
          return (
            <div key={caseStudy.title} className="w-full p-2">
              <BentoCard
                {...{
                  Icon: iconData.icon,
                  name: caseStudy.title,
                  description: caseStudy.description,
                  href: `/chat?replay=${iconData.id}`,
                  cta: t("clickToWatch"),
                  className: "w-full h-full",
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

```

### app/[locale]/landing/sections/core-features-section.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  Bird,
  Microscope,
  Usb,
  User,
  type LucideProps,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { BentoCard, BentoGrid } from "~/components/magicui/bento-grid";

import { SectionHeader } from "../components/section-header";

type FeatureIcon = {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href: string;
  className: string;
};

const featureIcons: Array<FeatureIcon> = [
  {
    Icon: Microscope,
    href: "https://github.com/bytedance/deer-flow/blob/main/src/tools",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: User,
    href: "https://github.com/bytedance/deer-flow/blob/main/src/graph/nodes.py",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Bird,
    href: "https://www.langchain.com/",
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Usb,
    href: "https://github.com/bytedance/deer-flow/blob/main/src/graph/nodes.py",
    className:
      "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4", // spans two rows to keep the grid balanced
  },
];

export function CoreFeatureSection() {
  const t = useTranslations("landing.coreFeatures");
  const tCommon = useTranslations("common");
  const features = t.raw("features") as Array<{
    name: string;
    description: string;
  }>;

  return (
    <section className="relative flex w-full flex-col content-around items-center justify-center">
      <SectionHeader
        anchor="core-features"
        title={t("title")}
        description={t("description")}
      />
      <BentoGrid className="w-3/4 lg:grid-cols-2 lg:grid-rows-3">
        {features.map((feature, index) => {
          const iconData = featureIcons[index];
          return iconData ? (
            <BentoCard
              key={feature.name}
              {...iconData}
              {...feature}
              background={
                <img
                  alt="background"
                  className="absolute -top-20 -right-20 opacity-60"
                />
              }
              cta={tCommon("learnMore")}
            />
          ) : null;
        })}
      </BentoGrid>
    </section>
  );
}

```

### app/[locale]/landing/sections/multi-agent-section.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { useTranslations } from "next-intl";

import { MultiAgentVisualization } from "../components/multi-agent-visualization";
import { SectionHeader } from "../components/section-header";

export function MultiAgentSection() {
  const t = useTranslations("landing.multiAgent");
  return (
    <section className="relative flex w-full flex-col items-center justify-center">
      <SectionHeader
        anchor="multi-agent-architecture"
        title={t("title")}
        description={t("description")}
      />
      <div className="flex h-[70vh] w-full flex-col items-center justify-center">
        <div className="h-full w-full">
          <MultiAgentVisualization />
        </div>
      </div>
    </section>
  );
}

```

                ## components
                 - site-header.tsx
                 - jumbotron.tsx
                 - ray.tsx
                 - section-header.tsx
                 - multi-agent-visualization.tsx

### app/[locale]/landing/components/site-header.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { StarFilledIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from "~/components/deer-flow/language-switcher";
import { NumberTicker } from "~/components/magicui/number-ticker";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { Link } from "~/navigation";

export function SiteHeader() {
  const t = useTranslations('common');

  return (
    <header className="supports-backdrop-blur:bg-background/80 bg-background/40 sticky top-0 left-0 z-40 flex h-15 w-full flex-col items-center backdrop-blur-lg">
      <div className="container flex h-15 items-center justify-between px-3">
        <div className="text-xl font-medium">
          <span className="mr-1 text-2xl">🦌</span>
          <span>DeerFlow</span>
        </div>
        <div className="relative flex items-center gap-2">
          <LanguageSwitcher />
          <div
            className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-full opacity-60 blur-2xl"
            style={{
              background: "linear-gradient(90deg, #ff80b5 0%, #9089fc 100%)",
              filter: "blur(32px)",
            }}
          />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="group relative z-10"
          >
            <Link href="https://github.com/bytedance/deer-flow" target="_blank">
              <GitHubLogoIcon className="size-4" />
              {t('starOnGitHub')}
              {env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY &&
                env.GITHUB_OAUTH_TOKEN && <StarCounter />}
            </Link>
          </Button>
        </div>
      </div>
      <hr className="from-border/0 via-border/70 to-border/0 m-0 h-px w-full border-none bg-gradient-to-r" />
    </header>
  );
}

export async function StarCounter() {
  let stars = 1000; // Default value

  try {
    const response = await fetch(
      "https://api.github.com/repos/bytedance/deer-flow",
      {
        headers: env.GITHUB_OAUTH_TOKEN
          ? {
              Authorization: `Bearer ${env.GITHUB_OAUTH_TOKEN}`,
              "Content-Type": "application/json",
            }
          : {},
        next: {
          revalidate: 3600,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      stars = data.stargazers_count ?? stars; // Update stars if API response is valid
    }
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
  }
  return (
    <>
      <StarFilledIcon className="size-4 transition-colors duration-300 group-hover:text-yellow-500" />
      {stars && (
        <NumberTicker className="font-mono tabular-nums" value={stars} />
      )}
    </>
  );
}

```

### app/[locale]/landing/components/jumbotron.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { GithubFilled } from "@ant-design/icons";
import { ChevronRight } from "lucide-react";
import { useTranslations } from 'next-intl';

import { AuroraText } from "~/components/magicui/aurora-text";
import { FlickeringGrid } from "~/components/magicui/flickering-grid";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { Link } from "~/navigation";

export function Jumbotron() {
  const t = useTranslations('hero');
  const tCommon = useTranslations('common');
  
  return (
    <section className="flex h-[95vh] w-full flex-col items-center justify-center pb-15">
      <FlickeringGrid
        id="deer-hero-bg"
        className={`absolute inset-0 z-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]`}
        squareSize={4}
        gridGap={4}
        color="#60A5FA"
        maxOpacity={0.133}
        flickerChance={0.1}
      />
      <FlickeringGrid
        id="deer-hero"
        className="absolute inset-0 z-0 translate-y-[2vh] mask-[url(/images/deer-hero.svg)] mask-size-[100vw] mask-center mask-no-repeat md:mask-size-[72vh]"
        squareSize={3}
        gridGap={6}
        color="#60A5FA"
        maxOpacity={0.64}
        flickerChance={0.12}
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-12">
        <h1 className="text-center text-4xl font-bold md:text-6xl">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {t('title')}{" "}
          </span>
          <AuroraText>{t('subtitle')}</AuroraText>
        </h1>
        <p className="max-w-4xl p-2 text-center text-sm opacity-85 md:text-2xl">
          {t('description')}
        </p>
        <div className="flex gap-6">
          <Button className="hidden text-lg md:flex md:w-42" size="lg" asChild>
            <Link
              target={
                env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY ? "_blank" : undefined
              }
              href={
                env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY
                  ? "https://github.com/bytedance/deer-flow"
                  : "/chat"
              }
            >
              {tCommon('getStarted')} <ChevronRight />
            </Link>
          </Button>
          {!env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY && (
            <Button
              className="w-42 text-lg"
              size="lg"
              variant="outline"
              asChild
            >
              <Link
                href="https://github.com/bytedance/deer-flow"
                target="_blank"
              >
                <GithubFilled />
                {tCommon('learnMore')}
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="absolute bottom-8 flex text-xs opacity-50">
        <p>{t('footnote')}</p>
      </div>
    </section>
  );
}

```

                ## store
                 - mav-store.ts
                 - graph.ts
                 - index.ts
                 - playbook.ts

### app/[locale]/landing/store/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./graph";
export * from "./playbook";

```

            ## (main)
             - layout.tsx

### app/[locale]/(main)/layout.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useRouter } from "~/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/core/auth/hooks";
import { GlobalHeader } from "~/features/workspace/layout/GlobalHeader";

// This layout wraps all protected routes and enforces authentication.
export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex h-12 w-full items-center border-b px-4">
          <Skeleton className="h-6 w-48" />
        </header>
        <main className="flex-grow">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <GlobalHeader />
      <main className="flex-grow">{children}</main>
    </div>
  );
}

```

                ## settings
                 - page.tsx

### app/[locale]/(main)/settings/page.tsx Content:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import type { UserSettingsRead, UserSettingsUpdate } from "~/core/domain";
import {
  useUpdateSettings,
  useUserSettings,
} from "~/features/settings/hooks/useUserSettings";
import { cn } from "~/lib/utils";

import { SETTINGS_TABS } from "./tabs";

const settingsSchema = z.object({
  language: z.enum(["en", "zh"]),
  theme: z.enum(["light", "dark"]),
  hitl_profile: z.enum(["Novice", "Experienced", "Expert"]),
  thinking_depth: z.enum(["Instant", "Medium", "Heavy"]),
  llm_model_name: z.union([z.string().trim(), z.null()]).optional(),
  llm_base_url: z
    .union([z.string().trim().url(), z.literal(""), z.null()])
    .optional(),
  llm_api_key: z.string().optional().nullable(),
  e2b_api_key: z.string().optional().nullable(),
});

const mapSettingsToFormValues = (
  data: UserSettingsRead,
): UserSettingsUpdate => ({
  language: data.language,
  theme: data.theme,
  hitl_profile: data.hitl_profile,
  thinking_depth: data.thinking_depth,
  llm_model_name: data.llm_model_name,
  llm_base_url: data.llm_base_url,
  llm_api_key: null,
  e2b_api_key: null,
});

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tTabs = useTranslations("settings.tabs");

  const [activeTabId, setActiveTabId] = useState(SETTINGS_TABS[0]!.id);
  const { data: settings, isLoading } = useUserSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings();

  const form = useForm<UserSettingsUpdate>({
    resolver: zodResolver(settingsSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields },
  } = form;

  useEffect(() => {
    if (settings) {
      reset(mapSettingsToFormValues(settings));
    }
  }, [settings, reset]);

  const onSubmit = (data: UserSettingsUpdate) => {
    if (!isDirty) return;

    const changedData: Partial<UserSettingsUpdate> = {};
    for (const key of Object.keys(dirtyFields)) {
      const fieldKey = key as keyof UserSettingsUpdate;
      changedData[fieldKey] = data[fieldKey] ?? null;
    }

    if (changedData.llm_api_key === "") changedData.llm_api_key = null;
    if (changedData.e2b_api_key === "") changedData.e2b_api_key = null;
    if (changedData.llm_base_url === "") changedData.llm_base_url = null;
    if (changedData.llm_model_name === "") changedData.llm_model_name = null;

    if (Object.keys(changedData).length > 0) {
      updateSettings(changedData);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl space-y-6 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-full" />
        <div className="flex gap-8">
          <Skeleton className="h-48 w-52" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container mx-auto max-w-5xl py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <div className="flex gap-8">
            <nav className="flex w-52 shrink-0 flex-col">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTabId === tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    "mb-1 flex h-9 w-full cursor-pointer items-center justify-start gap-2 rounded px-3 text-sm font-medium",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    activeTabId === tab.id &&
                      "!bg-primary !text-primary-foreground",
                  )}
                >
                  <tab.icon size={16} />
                  <span>
                    {tTabs(tab.id as "general" | "ai-config" | "about")}
                  </span>
                </button>
              ))}
            </nav>

            <main className="min-w-0 flex-grow">
              {SETTINGS_TABS.map((tab) => (
                <div
                  key={tab.id}
                  role="tabpanel"
                  className={cn(activeTabId !== tab.id && "hidden")}
                >
                  <tab.component
                    hasLlmApiKey={settings.has_llm_api_key}
                    hasE2bApiKey={settings.has_e2b_api_key}
                  />
                </div>
              ))}
            </main>
          </div>
        </div>

        <footer
          className={cn(
            "sticky bottom-0 mt-8 border-t bg-background/80 py-4 backdrop-blur transition-opacity",
            isDirty ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="container mx-auto flex max-w-5xl justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset(mapSettingsToFormValues(settings))}
              disabled={isSaving}
            >
              {tCommon("reset")}
            </Button>
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCommon("saveChanges")}
            </Button>
          </div>
        </footer>
      </form>
    </FormProvider>
  );
}

```

                    ## tabs
                     - index.tsx
                     - about-zh.md
                     - about-en.md
                     - about-tab.tsx

### app/[locale]/(main)/settings/tabs/index.tsx Content:

```tsx
import { BrainCircuit, Info, Settings } from "lucide-react";

import { AboutTab } from "~/features/settings/components/AboutTab";
import { AiConfigTab } from "~/features/settings/components/AiConfigTab";
import { GeneralTab } from "~/features/settings/components/GeneralTab";
import type { SettingsTab } from "~/features/settings/types";

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "general",
    icon: Settings,
    component: GeneralTab,
  },
  {
    id: "ai-config",
    icon: BrainCircuit,
    component: AiConfigTab,
  },
  {
    id: "about",
    icon: Info,
    component: AboutTab,
  },
];

```

### app/[locale]/(main)/settings/tabs/about-tab.tsx Content:

```tsx
"use client";

import { useLocale } from "next-intl";

import { Markdown } from "~/components/deer-flow/markdown";

import aboutEn from "./about-en.md";
import aboutZh from "./about-zh.md";

export function AboutTab() {
  const locale = useLocale();
  return (
    <div className="prose dark:prose-invert max-w-none">
      <Markdown>{locale === "zh" ? aboutZh : aboutEn}</Markdown>
    </div>
  );
}

```

                    ## dialogs

                ## projects

                    ## [projectId]
                     - layout.tsx

### app/[locale]/(main)/projects/[projectId]/layout.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import * as React from "react";
import type { ReactNode } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { RealtimeProvider } from "~/core/realtime/RealtimeProvider";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { useProjectDetail } from "~/features/dashboard/hooks/useProjects";
import { ProjectWorkspaceProvider } from "~/features/workspace/context/ProjectWorkspaceContext";
import { InspectorPanel } from "~/features/workspace/inspector";
import { NavigatorPanel } from "~/features/workspace/navigator/NavigatorPanel";
import { useParams, usePathname, useRouter } from "~/navigation";

export default function ProjectWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isFlowRoute = pathSegments[pathSegments.length - 1] === "flow";
  const projectIdParam = params?.projectId;
  const projectId = Number(projectIdParam);
  const isValidProjectId = Number.isFinite(projectId);
  const navigatorPanelRef = React.useRef<ImperativePanelHandle | null>(null);
  const inspectorPanelRef = React.useRef<ImperativePanelHandle | null>(null);

  const [isNavSheetOpen, setNavSheetOpen] = React.useState(false);
  const [isInspectorSheetOpen, setInspectorSheetOpen] = React.useState(false);

  const { layout, updateLayout } = useWorkspaceStore(
    useShallow((state) => ({
      layout: state.layout,
      updateLayout: state.updateLayout,
    })),
  );

  const collapseNavigator = React.useCallback(() => {
    if (navigatorPanelRef.current) {
      navigatorPanelRef.current.collapse();
    } else {
      updateLayout({ isNavigatorCollapsed: true });
    }
  }, [updateLayout]);

  const expandNavigator = React.useCallback(() => {
    if (navigatorPanelRef.current) {
      navigatorPanelRef.current.expand();
      navigatorPanelRef.current.resize(layout.navigatorWidth);
    } else {
      updateLayout({ isNavigatorCollapsed: false });
    }
  }, [layout.navigatorWidth, updateLayout]);

  const collapseInspector = React.useCallback(() => {
    if (inspectorPanelRef.current) {
      inspectorPanelRef.current.collapse();
    } else {
      updateLayout({ isInspectorCollapsed: true });
    }
  }, [updateLayout]);

  const expandInspector = React.useCallback(() => {
    if (inspectorPanelRef.current) {
      inspectorPanelRef.current.expand();
      inspectorPanelRef.current.resize(layout.inspectorWidth);
    } else {
      updateLayout({ isInspectorCollapsed: false });
    }
  }, [layout.inspectorWidth, updateLayout]);

  React.useEffect(() => {
    const panel = navigatorPanelRef.current;
    if (!panel) return;

    if (layout.isNavigatorCollapsed && !panel.isCollapsed()) {
      panel.collapse();
      return;
    }

    if (!layout.isNavigatorCollapsed && panel.isCollapsed()) {
      panel.expand();
      panel.resize(layout.navigatorWidth);
    }
  }, [layout.isNavigatorCollapsed, layout.navigatorWidth]);

  React.useEffect(() => {
    const panel = inspectorPanelRef.current;
    if (!panel) return;

    if (layout.isInspectorCollapsed && !panel.isCollapsed()) {
      panel.collapse();
      return;
    }

    if (!layout.isInspectorCollapsed && panel.isCollapsed()) {
      panel.expand();
      panel.resize(layout.inspectorWidth);
    }
  }, [layout.isInspectorCollapsed, layout.inspectorWidth]);

  const {
    data: project,
    error,
    isError,
    isLoading,
    refetch,
  } = useProjectDetail(isValidProjectId ? projectId : null, {
    enabled: isValidProjectId,
  });

  if (!isValidProjectId) {
    return (
      <ErrorDisplay message="The provided project identifier is not valid." />
    );
  }

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError || !project) {
    return (
      <ErrorDisplay
        message={error instanceof Error ? error.message : "This project could not be found."}
        onRetry={refetch}
      />
    );
  }

  if (project.status === "Configuring") {
    if (isFlowRoute) {
      return <FlowAccessRedirect projectId={project.id} />;
    }
    return <>{children}</>;
  }

  const workflowInstanceId = project.workflow_instance_id;

  if (!workflowInstanceId) {
    return (
      <ErrorDisplay
        message="This project is running but has no associated workflow."
        onRetry={refetch}
      />
    );
  }

  return (
    <ProjectWorkspaceProvider project={project}>
      <RealtimeProvider workflowId={workflowInstanceId}>
        {/* Mobile layout (handled inside individual pages) */}
        <div className="h-full md:hidden">{children}</div>

        {/* Tablet layout: navigator/inspector become sheets */}
        <div className="hidden h-full md:block lg:hidden">
          <div className="relative flex h-full">
            <div className="absolute left-4 top-4 z-10">
              <Sheet open={isNavSheetOpen} onOpenChange={setNavSheetOpen}>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open Navigator"
                  onClick={() => setNavSheetOpen(true)}
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
                <SheetContent side="left" className="w-[350px] p-0">
                  <SheetHeader className="p-4">
                    <SheetTitle>Workflow Navigator</SheetTitle>
                  </SheetHeader>
                  <div className="h-[calc(100%-4rem)]">
                    <NavigatorPanel workflowId={workflowInstanceId} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <main className="h-full flex-1">{children}</main>

            <div className="absolute right-4 top-4 z-10">
              <Sheet
                open={isInspectorSheetOpen}
                onOpenChange={setInspectorSheetOpen}
              >
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open Inspector"
                  onClick={() => setInspectorSheetOpen(true)}
                >
                  <PanelRightOpen className="h-4 w-4" />
                </Button>
                <SheetContent side="right" className="w-[400px] p-4">
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle>Inspector</SheetTitle>
                  </SheetHeader>
                  <InspectorPanel workflowId={workflowInstanceId} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Desktop layout with resizable panels */}
        <div className="hidden h-full lg:block">
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
              if (sizes[0] && sizes[2]) {
                updateLayout({
                  navigatorWidth: sizes[0],
                  inspectorWidth: sizes[2],
                });
              }
            }}
          >
            <ResizablePanel
              data-testid="navigator-panel"
              defaultSize={layout.navigatorWidth}
              collapsedSize={4}
              collapsible
              minSize={15}
              onCollapse={() => updateLayout({ isNavigatorCollapsed: true })}
              onExpand={() => updateLayout({ isNavigatorCollapsed: false })}
              ref={navigatorPanelRef}
            >
              {layout.isNavigatorCollapsed ? (
                <div className="flex h-full items-center justify-center p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={expandNavigator}
                  >
                    <PanelRightOpen className="h-4 w-4" />
                    <span className="sr-only">Expand Navigator</span>
                  </Button>
                </div>
              ) : (
                <div className="flex h-full flex-col gap-4 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Workflow Navigator</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={collapseNavigator}
                    >
                      <PanelLeftClose className="h-4 w-4" />
                      <span className="sr-only">Collapse Navigator</span>
                    </Button>
                  </div>
                  <div className="min-h-0 flex-1">
                    <NavigatorPanel workflowId={workflowInstanceId} />
                  </div>
                </div>
              )}
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel className="min-w-0">{children}</ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              data-testid="inspector-panel"
              defaultSize={layout.inspectorWidth}
              collapsedSize={4}
              collapsible
              minSize={20}
              onCollapse={() => updateLayout({ isInspectorCollapsed: true })}
              onExpand={() => updateLayout({ isInspectorCollapsed: false })}
              ref={inspectorPanelRef}
            >
              {layout.isInspectorCollapsed ? (
                <div className="flex h-full items-center justify-center p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={expandInspector}
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                    <span className="sr-only">Expand Inspector</span>
                  </Button>
                </div>
              ) : (
                <div className="flex h-full flex-col gap-4 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Inspector</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={collapseInspector}
                    >
                      <PanelRightClose className="h-4 w-4" />
                      <span className="sr-only">Collapse Inspector</span>
                    </Button>
                  </div>
                  <div className="min-h-0 flex-1">
                    <InspectorPanel workflowId={workflowInstanceId} />
                  </div>
                </div>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </RealtimeProvider>
    </ProjectWorkspaceProvider>
  );
}

function FlowAccessRedirect({ projectId }: { projectId: number }) {
  const router = useRouter();

  React.useEffect(() => {
    router.replace(`/projects/${projectId}/config`);
  }, [projectId, router]);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="max-w-lg border-muted/40">
        <CardHeader>
          <CardTitle>Workflow not ready yet</CardTitle>
          <CardDescription>
            This project is still being configured. You&apos;ll be redirected to
            the configuration page to finish setup before using the workspace.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.replace(`/projects/${projectId}/config`)}>
            Continue to configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex h-full w-full">
      <Skeleton className="hidden h-full w-[25%] lg:block" />
      <div className="hidden w-px bg-border lg:block" />
      <Skeleton className="h-full flex-grow" />
      <div className="hidden w-px bg-border lg:block" />
      <Skeleton className="hidden h-full w-[30%] lg:block" />
    </div>
  );
}

function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="max-w-lg border-destructive/40">
        <CardHeader>
          <CardTitle>Unable to load project</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {onRetry ? (
          <CardFooter>
            <Button onClick={() => onRetry()}>Retry</Button>
          </CardFooter>
        ) : null}
        {!onRetry ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Double-check the project identifier and try again.
            </p>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}

```

                        ## config
                         - page.tsx

### app/[locale]/(main)/projects/[projectId]/config/page.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useProjectDetail,
  useStartWorkflow,
} from "~/features/dashboard/hooks/useProjects";
import { ProjectDetailsCard } from "~/features/workspace/config/ProjectDetailsCard";
import { ProjectFilesCard } from "~/features/workspace/config/ProjectFilesCard";
import { useParams, useRouter } from "~/navigation";

export default function ProjectConfigPage() {
  const router = useRouter();
  const params = useParams<{ projectId?: string }>();
  const projectIdParam = params?.projectId;
  const projectId = Number(projectIdParam);
  const isValidProjectId = Number.isFinite(projectId);

  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useProjectDetail(isValidProjectId ? projectId : null, {
    enabled: isValidProjectId,
  });

  const startWorkflowMutation = useStartWorkflow();

  useEffect(() => {
    if (project?.status === "Running") {
      router.push(`/projects/${project.id}/flow`);
    }
  }, [project, router]);

  const hasProblemDescriptionFile =
    project?.files.some((file) => file.role === "Problem Description") ?? false;
  const isConfiguring = project?.status === "Configuring";
  const canStartWorkflow = Boolean(isConfiguring && hasProblemDescriptionFile);

  const handleStartWorkflow = () => {
    if (!project || !isConfiguring) {
      return;
    }
    startWorkflowMutation.mutate(project.id);
  };

  if (!isValidProjectId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Project</CardTitle>
            <CardDescription>
              The provided project identifier is not valid.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <ProjectConfigSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Unable to load project</CardTitle>
            <CardDescription>
              Something went wrong while fetching this project. Please try
              again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!project) {
    return <ProjectConfigSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Configure Project
        </h1>
        <p className="text-muted-foreground">
          Update project metadata, upload the required files, and start the
          workflow when ready.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProjectDetailsCard project={project} />
          <ProjectFilesCard project={project} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Workflow</CardTitle>
              <CardDescription>
                Ensure a Problem Description file is uploaded before launching
                the workflow. Projects that are already running or completed
                cannot be relaunched.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isConfiguring
                  ? "The workflow becomes available once the Problem Description file is present. Upload it in the Project Files section if you haven’t already."
                  : "This project has already moved past the configuration stage. Review the workflow instead of relaunching it."}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!canStartWorkflow || startWorkflowMutation.isPending}
                onClick={handleStartWorkflow}
              >
                {startWorkflowMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isConfiguring
                  ? hasProblemDescriptionFile
                    ? "Launch Workflow"
                    : "Awaiting Problem Description"
                  : project.status === "Running"
                    ? "Workflow In Progress"
                    : "Workflow Completed"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProjectConfigSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

```

                        ## flow
                         - page.tsx

### app/[locale]/(main)/projects/[projectId]/flow/page.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "~/navigation";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { WorkflowInstanceRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useProjectWorkspace } from "~/features/workspace/context/ProjectWorkspaceContext";
import { CanvasContainer } from "~/features/workspace/canvas/CanvasContainer";
import { useWorkflow } from "~/features/workspace/hooks/useWorkflowData";
import { InspectorPanel } from "~/features/workspace/inspector";
import { NavigatorPanel } from "~/features/workspace/navigator/NavigatorPanel";

function MobileNodeDetailView({
  workflowId,
  workflow,
}: {
  workflowId: number;
  workflow?: WorkflowInstanceRead;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center border-b p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(pathname)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to list</span>
        </Button>
        <h2 className="ml-2 font-semibold">Node Details</h2>
      </header>
      <Tabs defaultValue="view" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="m-2 shrink-0">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="inspector">Inspector</TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <CanvasContainer workflow={workflow} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="inspector" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <InspectorPanel workflowId={workflowId} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectFlowPage() {
  const { workflowId } = useProjectWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { focusNode, focusedNodeId } = useWorkspaceStore(
    useShallow((state) => ({
      focusNode: state.focusNode,
      focusedNodeId: state.focusedNodeId,
    })),
  );

  const nodeQueryParam = searchParams.get("node");
  const showMobileDetailView = !!nodeQueryParam;
  React.useEffect(() => {
    if (!nodeQueryParam) {
      if (focusedNodeId !== null) {
        focusNode(null);
      }
      return;
    }
    const parsedNodeId = Number(nodeQueryParam);
    const nextFocusedNodeId = Number.isNaN(parsedNodeId)
      ? null
      : parsedNodeId;
    if (nextFocusedNodeId !== focusedNodeId) {
      focusNode(nextFocusedNodeId);
    }
  }, [nodeQueryParam, focusNode, focusedNodeId]);

  const {
    data: workflow,
    isLoading,
    isError,
    error,
  } = useWorkflow(workflowId, { enabled: !Number.isNaN(workflowId) });

  React.useEffect(() => {
    if (focusedNodeId !== null) {
      return;
    }

    const nodes = workflow?.nodes;
    if (!nodes?.length) {
      return;
    }

    const sortedNodes = [...nodes].sort(
      (a, b) => a.order_index - b.order_index,
    );

    const nodeAwaitingHitl = sortedNodes.find(
      (node) => node.status === "Awaiting HITL Approval",
    );
    if (nodeAwaitingHitl) {
      focusNode(nodeAwaitingHitl.id);
      return;
    }

    const executingNode = sortedNodes.find((node) => node.status === "Executing");
    if (executingNode) {
      focusNode(executingNode.id);
    }
  }, [workflow, focusedNodeId, focusNode]);

  const handleMobileNodeSelect = (nodeId: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("node", String(nodeId));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <>
      <div
        className="h-full md:hidden"
        onClickCapture={(event) => {
          const target = event.target as HTMLElement;
          const button = target.closest("button[data-node-id]");
          if (button) {
            const nodeId = button.getAttribute("data-node-id");
            if (nodeId) {
              event.preventDefault();
              event.stopPropagation();
              handleMobileNodeSelect(Number(nodeId));
            }
          }
        }}
      >
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <div className="p-4 text-center text-sm text-destructive">
            Failed to load workflow data.
          </div>
        )}
        {workflow &&
          (showMobileDetailView ? (
            <MobileNodeDetailView workflowId={workflowId} workflow={workflow} />
          ) : (
            <NavigatorPanel workflowId={workflowId} />
          ))}
      </div>

      <div className="hidden h-full min-h-0 bg-background text-foreground md:block">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-destructive">
            <p>Failed to load workflow.</p>
            <p className="text-xs text-destructive/80">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : (
          <CanvasContainer workflow={workflow} />
        )}
      </div>
    </>
  );
}

```

                ## dashboard
                 - page.tsx

### app/[locale]/(main)/dashboard/page.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { ProjectDashboardClient } from "~/features/dashboard/components/ProjectDashboardClient";

export default function DashboardPage() {
  return <ProjectDashboardClient />;
}

```

            ## (auth)
             - layout.tsx

### app/[locale]/(auth)/layout.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ReactNode } from "react";

/**
 * Provides a consistent, centered layout for all authentication-related pages.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app p-4">
      {children}
    </main>
  );
}

```

                ## register
                 - page.tsx

### app/[locale]/(auth)/register/page.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useRouter } from "~/navigation";
import { useEffect } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/core/auth/hooks";
import { RegisterForm } from "~/features/authentication/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="w-full max-w-md">
        <Skeleton className="h-[550px] w-full" />
      </div>
    );
  }

  return <RegisterForm />;
}

```

                ## login
                 - page.tsx

### app/[locale]/(auth)/login/page.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useRouter } from "~/navigation";
import { useEffect } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/core/auth/hooks";
import { LoginForm } from "~/features/authentication/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="w-full max-w-md">
        <Skeleton className="h-[450px] w-full" />
      </div>
    );
  }

  return <LoginForm />;
}

```

        ## api

            ## proxy

                ## [...proxyPath]

    ## typings
     - md.d.ts

    ## features
     - README.md

        ## settings
         - types.ts

### features/settings/types.ts Content:

```ts
import type { LucideIcon } from "lucide-react";

export interface SettingsTabProps {
  hasLlmApiKey: boolean;
  hasE2bApiKey: boolean;
}

export interface SettingsTab {
  id: string;
  icon: LucideIcon;
  component: (props: SettingsTabProps) => JSX.Element;
}

```

            ## components
             - GeneralTab.tsx
             - AiConfigTab.tsx
             - ApiKeyInput.tsx
             - AboutTab.tsx

### features/settings/components/GeneralTab.tsx Content:

```tsx
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { UserSettingsUpdate } from "~/core/domain";

import type { SettingsTabProps } from "../types";

export function GeneralTab(_: SettingsTabProps) {
  const { control } = useFormContext<UserSettingsUpdate>();
  const t = useTranslations("settings.generalTab");

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <FormField
        control={control}
        name="theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("theme.label")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder={t("theme.placeholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="light">{t("theme.light")}</SelectItem>
                <SelectItem value="dark">{t("theme.dark")}</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>{t("theme.description")}</FormDescription>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("language.label")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder={t("language.placeholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="en">{t("language.en")}</SelectItem>
                <SelectItem value="zh">{t("language.zh")}</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>{t("language.description")}</FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}

```

### features/settings/components/AiConfigTab.tsx Content:

```tsx
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { UserSettingsUpdate } from "~/core/domain";

import type { SettingsTabProps } from "../types";

import { ApiKeyInput } from "./ApiKeyInput";

export function AiConfigTab({
  hasLlmApiKey,
  hasE2bApiKey,
}: SettingsTabProps) {
  const { control } = useFormContext<UserSettingsUpdate>();
  const t = useTranslations("settings.aiConfigTab");

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>

      <div className="space-y-6 rounded-lg border p-4">
        <h3 className="font-medium">{t("interactionCardTitle")}</h3>
        <FormField
          control={control}
          name="hitl_profile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("hitlProfile.label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder={t("hitlProfile.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Novice">{t("hitlProfile.novice")}</SelectItem>
                  <SelectItem value="Experienced">
                    {t("hitlProfile.experienced")}
                  </SelectItem>
                  <SelectItem value="Expert">
                    {t("hitlProfile.expert")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>{t("hitlProfile.description")}</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="thinking_depth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("thinkingDepth.label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-60">
                    <SelectValue
                      placeholder={t("thinkingDepth.placeholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Instant">
                    {t("thinkingDepth.instant")}
                  </SelectItem>
                  <SelectItem value="Medium">
                    {t("thinkingDepth.medium")}
                  </SelectItem>
                  <SelectItem value="Heavy">
                    {t("thinkingDepth.heavy")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>{t("thinkingDepth.description")}</FormDescription>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-6 rounded-lg border p-4">
        <h3 className="font-medium">{t("byokModelCardTitle")}</h3>
        <FormField
          control={control}
          name="llm_model_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("llmModel.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("llmModel.placeholder")}
                />
              </FormControl>
              <FormDescription>{t("llmModel.description")}</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="llm_base_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("llmBaseUrl.label")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("llmBaseUrl.placeholder")}
                />
              </FormControl>
              <FormDescription>{t("llmBaseUrl.description")}</FormDescription>
            </FormItem>
          )}
        />
        <ApiKeyInput
          fieldName="llm_api_key"
          label={t("llmApiKey.label")}
          hasKey={hasLlmApiKey}
          placeholder={t("llmApiKey.placeholder")}
          statusText={t("apiKeyStatus")}
          clearButtonText={t("clearAndReplace")}
        />
      </div>

      <div className="space-y-6 rounded-lg border p-4">
        <h3 className="font-medium">{t("byokE2bCardTitle")}</h3>
        <ApiKeyInput
          fieldName="e2b_api_key"
          label={t("e2bApiKey.label")}
          hasKey={hasE2bApiKey}
          placeholder={t("e2bApiKey.placeholder")}
          statusText={t("apiKeyStatus")}
          clearButtonText={t("clearAndReplace")}
        />
      </div>
    </div>
  );
}

```

### features/settings/components/ApiKeyInput.tsx Content:

```tsx
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { UserSettingsUpdate } from "~/core/domain";

type ApiKeyField = "llm_api_key" | "e2b_api_key";

interface ApiKeyInputProps {
  fieldName: ApiKeyField;
  label: string;
  hasKey: boolean;
  placeholder: string;
  statusText: string;
  clearButtonText: string;
}

export function ApiKeyInput({
  fieldName,
  label,
  hasKey,
  placeholder,
  statusText,
  clearButtonText,
}: ApiKeyInputProps) {
  const { control, setValue, formState } =
    useFormContext<UserSettingsUpdate>();
  const [showPassword, setShowPassword] = React.useState(false);

  const isDirty = Boolean(formState.dirtyFields[fieldName]);
  const isEditing = !hasKey || isDirty;

  const handleClearAndReplace = () => {
    setValue(fieldName, "", { shouldDirty: true, shouldTouch: true });
  };

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {isEditing ? (
            <div className="relative">
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type={showPassword ? "text" : "password"}
                  placeholder={placeholder}
                  autoComplete="new-password"
                />
              </FormControl>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide key" : "Show key"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          ) : (
            <div className="flex h-9 items-center justify-between rounded-md border border-input bg-muted/50 px-3 text-sm">
              <p className="text-muted-foreground">{statusText}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClearAndReplace}
              >
                {clearButtonText}
              </Button>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

```

### features/settings/components/AboutTab.tsx Content:

```tsx
import { useTranslations } from "next-intl";

import { Skeleton } from "~/components/ui/skeleton";
import { useSystemInfo } from "~/features/system/hooks/useSystem";

import type { SettingsTabProps } from "../types";

export function AboutTab(_: SettingsTabProps) {
  const t = useTranslations("settings.aboutTab");
  const { data: systemInfo, isLoading, isError } = useSystemInfo();

  const versionContent = (() => {
    if (isLoading) return <Skeleton className="h-5 w-24" />;
    if (isError) {
      return (
        <span className="font-mono text-sm text-destructive">Unavailable</span>
      );
    }
    return (
      <span className="font-mono text-sm text-foreground">
        {systemInfo?.app_version ?? "—"}
      </span>
    );
  })();

  const modelContent = (() => {
    if (isLoading) return <Skeleton className="h-5 w-48" />;
    if (isError) {
      return (
        <span className="font-mono text-sm text-destructive">Unavailable</span>
      );
    }
    return (
      <span className="font-mono text-sm text-foreground">
        {systemInfo?.llm_model_name ?? "—"}
      </span>
    );
  })();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <div className="space-y-4 rounded-lg border p-4 text-sm">
        <p className="text-muted-foreground">{t("description")}</p>
        <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-3">
          <span className="font-medium text-muted-foreground">
            {t("versionLabel")}
          </span>
          {versionContent}

          <span className="font-medium text-muted-foreground">
            {t("defaultModelLabel")}
          </span>
          {modelContent}
        </div>
      </div>
    </div>
  );
}

```

            ## hooks
             - useUserSettings.ts

### features/settings/hooks/useUserSettings.ts Content:

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QueryKeys } from "~/core/api/queryKeys";
import { UserService } from "~/core/api/services/user.service";
import type { UserSettingsUpdate } from "~/core/domain";

/**
 * Fetches the current user's settings.
 */
export const useUserSettings = () => {
  return useQuery({
    queryKey: QueryKeys.userSettings(),
    queryFn: UserService.getSettings,
  });
};

/**
 * Creates a mutation handler for updating user settings.
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettingsUpdate>) =>
      UserService.updateSettings(settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.userSettings() });
      toast.success("Settings have been saved successfully.");
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "An unknown error occurred.";

      toast.error("Failed to save settings", { description });
    },
  });
};

```

        ## workspace

            ## context
             - ProjectWorkspaceContext.tsx

### features/workspace/context/ProjectWorkspaceContext.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import type { ProjectDetailRead } from "~/core/domain";

interface ProjectWorkspaceContextValue {
  project: ProjectDetailRead;
  projectId: number;
  workflowId: number;
}

const ProjectWorkspaceContext = createContext<ProjectWorkspaceContextValue | null>(null);

export function ProjectWorkspaceProvider({
  project,
  children,
}: {
  project: ProjectDetailRead;
  children: ReactNode;
}) {
  if (project.workflow_instance_id === null) {
    throw new Error("ProjectWorkspaceProvider requires a project with a workflow instance.");
  }

  const value: ProjectWorkspaceContextValue = {
    project,
    projectId: project.id,
    workflowId: project.workflow_instance_id,
  };

  return (
    <ProjectWorkspaceContext.Provider value={value}>
      {children}
    </ProjectWorkspaceContext.Provider>
  );
}

export function useProjectWorkspace(): ProjectWorkspaceContextValue {
  const context = useContext(ProjectWorkspaceContext);
  if (!context) {
    throw new Error("useProjectWorkspace must be used within a ProjectWorkspaceProvider.");
  }
  return context;
}

```

            ## config
             - ProjectDetailsCard.tsx
             - ProjectFilesCard.tsx

### features/workspace/config/ProjectDetailsCard.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { type ProjectDetailRead, type ProjectProblemType } from "~/core/domain";
import { useUpdateProject } from "~/features/dashboard/hooks/useProjects";

const formSchema = z.object({
  name: z.string().min(1, "Project name cannot be empty."),
  // OPTIMIZATION: Switched to nullable() to better match the API spec (string | null).
  description: z.string().nullable().optional(),
  problem_type: z.enum(["A", "B", "C", "D", "E", "F", "-"]),
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectDetailsCard({ project }: { project: ProjectDetailRead }) {
  const updateProjectMutation = useUpdateProject();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      problem_type: project.problem_type,
    },
  });

  // OPTIMIZATION: This effect syncs the form's default state with the latest server data.
  // This is crucial for resetting the `isDirty` flag after a successful update and re-fetch,
  // preventing the "Save Changes" button from being stuck enabled.
  useEffect(() => {
    form.reset({
      name: project.name,
      description: project.description ?? "",
      problem_type: project.problem_type,
    });
  }, [project, form]);

  const onSubmit = (data: FormValues) => {
    // OPTIMIZATION: Ensure empty description is sent as `null`, not `""`.
    const normalizedDescription =
      data.description === "" ? null : data.description ?? null;
    const payload = {
      ...data,
      description: normalizedDescription,
    };
    updateProjectMutation.mutate({ projectId: project.id, payload });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Update your project&rsquo;s name, description, and problem type.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="problem_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a problem type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(["-", "A", "B", "C", "D", "E", "F"] as ProjectProblemType[]).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {type === "-" ? "Not Set" : `Problem ${type}`}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* BUG FIX: Changed `name` from "name" to "description" */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your project goals."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t">
            <Button
              type="submit"
              disabled={
                !form.formState.isDirty || updateProjectMutation.isPending
              }
            >
              {updateProjectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

```

### features/workspace/config/ProjectFilesCard.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, HardDrive, Loader2, UploadCloud } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type FileRole, type ProjectDetailRead } from "~/core/domain";
import { useUploadFile } from "~/features/dashboard/hooks/useProjects";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  file: z.instanceof(File, { message: "A file is required." }),
  role: z.enum(["Problem Description", "Dataset", "Reference Material"], {
    required_error: "You must select a file role.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectFilesCard({ project }: { project: ProjectDetailRead }) {
  const uploadFileMutation = useUploadFile();
  // OPTIMIZATION: State to manage the replacement warning for unique roles.
  const [isReplacingUniqueRole, setIsReplacingUniqueRole] = useState(false);

  // OPTIMIZATION: Memoize this calculation to avoid re-computing on every render.
  const hasProblemDescriptionFile = useMemo(
    () => project.files.some((f) => f.role === "Problem Description"),
    [project.files],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        form.setValue("file", acceptedFiles[0], { shouldValidate: true });
        form.clearErrors("file");
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const onSubmit = async (data: FormValues) => {
    await uploadFileMutation.mutateAsync({
      projectId: project.id,
      file: data.file,
      role: data.role,
    });
    form.reset();
    setIsReplacingUniqueRole(false);
  };

  const selectedFile = form.watch("file");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Files</CardTitle>
        <CardDescription>
          Upload and manage your project&rsquo;s input files. Each file needs a
          role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {project.files.length > 0 ? (
          <ul className="space-y-3">
            {project.files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{file.filename}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {file.role}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <HardDrive className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              No files uploaded yet.
            </p>
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <div
                {...getRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors",
                  isDragActive && "border-primary bg-primary/10",
                )}
              >
                <input {...getInputProps()} />
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : "Drag & drop a file here, or click to select"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Single file at a time.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      {/* OPTIMIZATION: Logic to guide user on replacing unique files. */}
                      <Select
                        onValueChange={(value: FileRole) => {
                          field.onChange(value);
                          if (
                            value === "Problem Description" &&
                            hasProblemDescriptionFile
                          ) {
                            setIsReplacingUniqueRole(true);
                          } else {
                            setIsReplacingUniqueRole(false);
                          }
                        }}
                        value={field.value}
                        // OPTIMIZATION: Removed redundant `required` prop. Zod handles validation.
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a file role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            [
                              "Problem Description",
                              "Dataset",
                              "Reference Material",
                            ] as FileRole[]
                          ).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isReplacingUniqueRole ? (
                        <FormDescription className="text-amber-600 dark:text-amber-500">
                          A &lsquo;Problem Description&rsquo; file already
                          exists. Uploading will replace it.
                        </FormDescription>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={!selectedFile || uploadFileMutation.isPending}
                  className="w-full"
                >
                  {uploadFileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="mr-2 h-4 w-4" />
                  )}
                  {/* OPTIMIZATION: Dynamically change button text for clarity. */}
                  {isReplacingUniqueRole ? "Replace & Upload" : "Upload File"}
                </Button>
              </div>
              {form.formState.errors.file?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.file.message}
                </p>
              ) : null}
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}

```

            ## inspector
             - README.md
             - InspectorPanel.tsx
             - index.ts

### features/workspace/inspector/InspectorPanel.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { useWorkspaceStore } from "~/core/store";
import { useNodeDetail } from "~/features/workspace/hooks/useWorkflowData";

import {
  CurrentVersionTab,
  CurrentVersionTabSkeleton,
} from "./components/CurrentVersionTab";
import { HistoryTab } from "./components/HistoryTab";
import { InputOutputTab } from "./components/InputOutputTab";

interface InspectorPanelProps {
  workflowId: number;
}

export function InspectorPanel({ workflowId }: InspectorPanelProps) {
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);
  const {
    data: node,
    isLoading,
    isError,
    error,
    refetch,
  } = useNodeDetail(focusedNodeId);

  if (!focusedNodeId) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
        Select a node from the navigator to inspect its execution details.
      </div>
    );
  }

  if (isLoading) {
    return <CurrentVersionTabSkeleton />;
  }

  if (isError || !node) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Unable to load node details."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="current" className="flex h-full flex-col gap-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold">{node.name}</p>
        <p className="text-xs text-muted-foreground">Definition {node.definition_id}</p>
      </div>
      <TabsList className="w-full">
        <TabsTrigger value="current">Current Version</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="io">Input / Output</TabsTrigger>
      </TabsList>
      <TabsContent value="current" className="flex-1 overflow-y-auto">
        <CurrentVersionTab node={node} />
      </TabsContent>
      <TabsContent value="history" className="flex-1 overflow-y-auto">
        <HistoryTab
          activeVersionId={node.active_version_id}
          workflowId={workflowId}
        />
      </TabsContent>
      <TabsContent value="io" className="flex-1 overflow-y-auto">
        <InputOutputTab node={node} />
      </TabsContent>
    </Tabs>
  );
}

```

### features/workspace/inspector/index.ts Content:

```ts
export { InspectorPanel } from "./InspectorPanel";

```

                ## components
                 - HistoryTab.tsx
                 - VersionListItem.tsx
                 - InputOutputTab.tsx
                 - CurrentVersionTab.tsx
                 - DetailRow.tsx
                 - ExecutionDialog.tsx

### features/workspace/inspector/components/HistoryTab.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { AlertCircle, History } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkspaceStore } from "~/core/store";
import { useNodeVersions } from "~/features/workspace/hooks/useWorkflowData";

import { VersionListItem } from "./VersionListItem";

interface HistoryTabProps {
  activeVersionId: number | null;
  workflowId: number;
}

export function HistoryTab({ activeVersionId, workflowId }: HistoryTabProps) {
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);

  if (!focusedNodeId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Select a node to view its version history.
        </CardContent>
      </Card>
    );
  }

  const {
    data: versions,
    isLoading,
    isError,
    error,
    refetch,
  } = useNodeVersions(focusedNodeId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load history."}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
          <History className="h-6 w-6" />
          <p>No historical versions found for this node.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.map((version) => (
        <VersionListItem
          key={version.id}
          version={version}
          nodeId={focusedNodeId}
          workflowId={workflowId}
          isActiveVersion={version.id === activeVersionId}
        />
      ))}
    </div>
  );
}

```

### features/workspace/inspector/components/VersionListItem.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Check, Rocket } from "lucide-react";
import type { MouseEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { NodeVersionSummaryRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useActivateVersion } from "~/features/workspace/hooks/useNodeActions";
import { cn } from "~/lib/utils";

interface VersionListItemProps {
  version: NodeVersionSummaryRead;
  nodeId: number;
  workflowId: number;
  isActiveVersion: boolean;
}

export function VersionListItem({
  version,
  nodeId,
  workflowId,
  isActiveVersion,
}: VersionListItemProps) {
  const { inspectedVersionId, inspectVersion } = useWorkspaceStore(
    useShallow((state) => ({
      inspectedVersionId: state.inspectedVersionId,
      inspectVersion: state.inspectVersion,
    })),
  );
  const activateVersionMutation = useActivateVersion();

  const isInspected = version.id === inspectedVersionId;

  const handleActivate = (event: MouseEvent) => {
    event.stopPropagation();
    activateVersionMutation.mutate({
      nodeId,
      versionId: version.id,
      workflowId,
      versionNumber: version.version_number,
    });
  };

  const formattedDate = new Date(version.created_at).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isInspected}
      onClick={() => inspectVersion(version.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inspectVersion(version.id);
        }
      }}
      className={cn(
        "flex w-full cursor-pointer flex-col items-start gap-1.5 rounded-lg p-3 text-left transition-colors",
        "hover:bg-accent",
        isInspected && "bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-semibold">Version {version.version_number}</p>
        {isActiveVersion ? (
          <Badge variant="secondary" className="border border-green-500/30">
            <Check className="mr-1 h-3 w-3 text-green-500" />
            Active
          </Badge>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={handleActivate}
            disabled={activateVersionMutation.isPending}
            aria-label={`Activate version ${version.version_number}`}
          >
            <Rocket className="mr-1 h-3 w-3" />
            Activate
          </Button>
        )}
      </div>
      <p className="line-clamp-2 w-full text-xs text-muted-foreground">
        {version.summary ?? "No summary provided."}
      </p>
      <div className="mt-1 flex w-full items-center justify-between text-xs text-muted-foreground">
        <Badge variant="outline" className="font-mono text-xs">
          {version.source}
        </Badge>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}

```

### features/workspace/inspector/components/InputOutputTab.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { NodeDetailView } from "~/core/domain";

interface InputOutputTabProps {
  node: NodeDetailView;
}

export function InputOutputTab({ node }: InputOutputTabProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Structured I/O view for &quot;{node.name}&quot; will be implemented in
          a future task.
        </p>
      </CardContent>
    </Card>
  );
}

```

### features/workspace/inspector/components/CurrentVersionTab.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { AlertTriangle, Pencil, RotateCw } from "lucide-react";
import * as React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { NodeDetailView } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import {
  useReExecuteNode,
  useRetryNode,
} from "~/features/workspace/hooks/useNodeActions";

import { DetailRow } from "./DetailRow";
import { ExecutionDialog } from "./ExecutionDialog";

interface CurrentVersionTabProps {
  node: NodeDetailView;
}

export function CurrentVersionTab({ node }: CurrentVersionTabProps) {
  const [isReExecuteOpen, setReExecuteOpen] = React.useState(false);
  const [isRetryOpen, setRetryOpen] = React.useState(false);
  const startEditing = useWorkspaceStore((state) => state.startEditingNode);

  const { mutate: reExecute, isPending: isReExecuting } = useReExecuteNode();
  const { mutate: retry, isPending: isRetrying } = useRetryNode();

  const handleReExecute = (comments: string | null) => {
    reExecute({
      nodeId: node.id,
      payload: {
        modification_comments: comments,
        base_version_id: node.active_version_id,
      },
    });
    setReExecuteOpen(false);
  };

  const handleRetry = (comments: string | null) => {
    retry({
      nodeId: node.id,
      payload: { modification_comments: comments },
    });
    setRetryOpen(false);
  };

  const isBusy = isReExecuting || isRetrying;

  const canReExecute =
    node.status === "Completed" && node.node_type !== "Generator";
  const canRetry = node.status === "Failed";
  const canManualEdit =
    node.status === "Completed" && node.node_type !== "Generator";

  const formattedDate = node.active_version
    ? new Date(node.active_version.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const formattedTime = node.active_version
    ? new Date(node.active_version.created_at).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Node Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DetailRow label="ID">
            <span className="font-mono">{node.definition_id}</span>
          </DetailRow>
          <DetailRow label="Status">
            <Badge variant="outline">{node.status}</Badge>
          </DetailRow>
          <DetailRow label="HITL Mode">
            <Badge variant="secondary">{node.hitl_mode}</Badge>
          </DetailRow>
        </CardContent>
        {canRetry && (
          <CardFooter className="border-t pt-4">
            <ExecutionDialog
              open={isRetryOpen}
              onOpenChange={setRetryOpen}
              isLoading={isBusy}
              onSubmit={handleRetry}
              title="Retry Failed Node"
              description="Provide optional feedback or simply retry the execution with the same parameters."
              buttonText="Retry"
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  className="border-amber-600/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              }
            />
          </CardFooter>
        )}
      </Card>

      {node.active_version ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Active Version (v{node.active_version.version_number})
            </CardTitle>
            <CardDescription>
              {node.active_version.summary ?? "No summary provided."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Source">
              <Badge variant="outline">{node.active_version.source}</Badge>
            </DetailRow>
            <DetailRow label="Created">
              <span>
                {formattedDate}, {formattedTime}
              </span>
            </DetailRow>
          </CardContent>
          {(canReExecute || canManualEdit) && (
            <CardFooter className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              {canReExecute && (
                <ExecutionDialog
                  open={isReExecuteOpen}
                  onOpenChange={setReExecuteOpen}
                  isLoading={isBusy}
                  onSubmit={handleReExecute}
                  title="Re-execute Node"
                  description="Provide new instructions to generate an alternative version of this node's output. Leave blank to run with the same inputs."
                  buttonText="Re-execute"
                  trigger={
                    <Button variant="outline" size="sm" disabled={isBusy}>
                      <RotateCw className="mr-2 h-4 w-4" />
                      Re-execute
                    </Button>
                  }
                />
              )}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy || !canManualEdit}
                        onClick={() => startEditing(node.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Manual Edit
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canManualEdit && (
                    <TooltipContent>
                      <p>Generator nodes cannot be manually edited.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          )}
        </Card>
      ) : !canRetry ? (
        <Card className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            This node has no active version.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

export function CurrentVersionTabSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-2/5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

```

### features/workspace/inspector/components/DetailRow.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

/**
 * Displays a label/value pair within inspector cards.
 */
export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

```

### features/workspace/inspector/components/ExecutionDialog.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

interface ExecutionDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onSubmit: (comments: string | null) => void;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * A reusable dialog for triggering node execution actions (re-execute, retry)
 * that can accept optional user comments.
 */
export function ExecutionDialog({
  trigger,
  title,
  description,
  buttonText,
  onSubmit,
  isLoading,
  open,
  onOpenChange,
}: ExecutionDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { comments: "" },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values.comments || null);
    // Let the parent component close the dialog upon mutation initiation.
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional: Provide new instructions or feedback..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

```

            ## layout
             - GlobalHeader.tsx
             - README.md

### features/workspace/layout/GlobalHeader.tsx Content:

```tsx
"use client";

import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/core/auth/hooks";
import { UserNav } from "~/features/authentication/components/UserNav";
import {
  useExportProject,
  useProjectDetail,
} from "~/features/dashboard/hooks/useProjects";
import { Link } from "~/navigation";

type WorkspaceRouteParams = { projectId?: string | string[] };

export function GlobalHeader() {
  const t = useTranslations("layout");
  const params = useParams<WorkspaceRouteParams>();
  const { user } = useAuth();

  const projectIdParam = Array.isArray(params?.projectId)
    ? params.projectId[0]
    : params?.projectId;
  const projectId = projectIdParam
    ? Number.parseInt(projectIdParam, 10)
    : null;
  const isValidProjectId =
    typeof projectId === "number" && Number.isFinite(projectId);

  const { data: project, isLoading: isProjectLoading } = useProjectDetail(
    isValidProjectId ? projectId : null,
    {
      enabled: isValidProjectId,
    },
  );

  const exportMutation = useExportProject();

  const handleExport = () => {
    if (!project) return;
    exportMutation.mutate({
      projectId: project.id,
      projectName: project.name,
    });
  };

  return (
    <header className="flex h-12 w-full shrink-0 items-center border-b bg-background px-4">
      <div className="flex flex-1 items-center gap-4 overflow-hidden">
        <Link href="/dashboard" className="font-semibold text-foreground">
          {t("appTitle")}
        </Link>
        {isValidProjectId && (
          <>
            <span className="text-muted-foreground">/</span>
            {isProjectLoading ? (
              <Skeleton className="h-5 w-48" />
            ) : project ? (
              <span className="truncate font-medium text-foreground">
                {project.name}
              </span>
            ) : null}
          </>
        )}
      </div>

      <div className="ml-4 flex items-center gap-4">
        {project && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={
              project.status === "Configuring" || exportMutation.isPending
            }
            title={
              project.status === "Configuring"
                ? t("exportUnavailableHint")
                : t("exportAvailableHint")
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {t("exportButton")}
          </Button>
        )}

        {user && <UserNav user={user} />}
      </div>
    </header>
  );
}

```

            ## canvas
             - CanvasContainer.tsx
             - README.md

### features/workspace/canvas/CanvasContainer.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import type { NodeDetailView, WorkflowInstanceRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { HITLController } from "~/features/hitl/HITLController";
import { ExecutionGraph } from "~/features/workflow-graph/execution-view/ExecutionGraph";
import { useNodeDetail } from "~/features/workspace/hooks/useWorkflowData";
import { useIsMobile } from "~/hooks/use-mobile";

import { ManualEditorView } from "./views/ManualEditorView";
import { VersionReviewView } from "./views/VersionReviewView";

// --- Temporary stubs for future screens ---
function ProvenanceGraph() {
  return (
    <div className="flex h-full items-center justify-center p-4 text-center">
      Provenance Graph (History View)
      <br />
      <span className="text-sm text-muted-foreground">
        To be implemented in a future task.
      </span>
    </div>
  );
}

function ExecutionLoadingView({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}

function NodeFailureView({ node }: { node: NodeDetailView }) {
  const errorLog = node.pending_result?.error_log ?? null;
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-left">
        <h2 className="text-xl font-semibold text-destructive">
          Execution Failed
        </h2>
        <p className="mt-2 text-sm text-destructive/80">
          Node &quot;{node.name}&quot; failed to execute.
        </p>
        {errorLog && (
          <pre className="mt-4 max-h-64 w-full overflow-auto rounded bg-background/70 p-4 text-xs">
            {errorLog}
          </pre>
        )}
      </div>
    </div>
  );
}
// --- End stubs ---

interface CanvasContainerProps {
  workflow?: WorkflowInstanceRead | undefined;
}

/**
 * Switches the central canvas content based on WorkspaceStore state
 * and the currently focused node. Animations are handled via Framer Motion.
 */
export function CanvasContainer({ workflow }: CanvasContainerProps) {
  const isMobile = useIsMobile();
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);
  const inspectedVersionId = useWorkspaceStore(
    (state) => state.inspectedVersionId,
  );
  const editingNodeId = useWorkspaceStore((state) => state.editingNodeId);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const {
    data: node,
    isLoading: isNodeLoading,
    isError: isNodeError,
  } = useNodeDetail(focusedNodeId);

  const renderContent = () => {
    // 0. Manual Edit Mode takes highest priority
    if (editingNodeId && workflow) {
      if (isNodeLoading) {
        return <ExecutionLoadingView message="Loading editor..." />;
      }
      if (node && node.id === editingNodeId) {
        return <ManualEditorView node={node} workflowId={workflow.id} />;
      }
    }

    // 1. History Graph Mode
    if (viewMode === "HistoryGraph") {
      return <ProvenanceGraph />;
    }

    // 2. "Time Travel Mode": A specific version is being inspected.
    if (inspectedVersionId && focusedNodeId && workflow) {
      if (isNodeLoading) {
        return <ExecutionLoadingView message="Loading version context..." />;
      }
      if (isNodeError || !node) {
        if (!isMobile) return <ExecutionGraph workflow={workflow} />;
        return <ExecutionLoadingView message="Error loading version." />;
      }
      return (
        <VersionReviewView
          nodeId={focusedNodeId}
          versionId={inspectedVersionId}
          workflowId={workflow.id}
          isHistorical={inspectedVersionId !== node.active_version_id}
          nodeName={node.name}
        />
      );
    }

    // 3. Regular node loading state (not in "Time Travel")
    if (isNodeLoading) {
      return <ExecutionLoadingView message="Loading node details..." />;
    }

    // 4. Regular node error state
    if (isNodeError && workflow && !isMobile) {
      return <ExecutionGraph workflow={workflow} />;
    }

    // 5. Views for a focused node (when not in "Time Travel")
    if (focusedNodeId && node) {
      switch (node.status) {
        case "Awaiting HITL Approval":
          if (workflow) {
            return <HITLController node={node} workflowId={workflow.id} />;
          }
          return <ExecutionLoadingView message={`Loading ${node.name}...`} />;
        case "Executing":
          return <ExecutionLoadingView message={`Executing ${node.name}...`} />;
        case "Completed":
          if (node.active_version_id && workflow) {
            return (
              <VersionReviewView
                nodeId={node.id}
                versionId={node.active_version_id}
                workflowId={workflow.id}
                isHistorical={false}
                nodeName={node.name}
              />
            );
          }
          break;
        case "Failed":
          return <NodeFailureView node={node} />;
        default:
          break;
      }
    }

    // 6. Default view: Show the main graph if a workflow is loaded
    if (workflow && !isMobile) {
      return <ExecutionGraph workflow={workflow} />;
    }

    // 7. Ultimate fallback: Loading the workflow itself
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  };

  const animationKey = `${viewMode}-${focusedNodeId ?? "none"}-${
    inspectedVersionId ?? "live"
  }-${editingNodeId ?? "none"}`;

  return (
    <div className="h-full w-full bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

```

                ## views
                 - VersionReviewView.tsx
                 - ManualEditorView.tsx

### features/workspace/canvas/views/VersionReviewView.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  AlertCircle,
  ArrowLeft,
  Book,
  Check,
  ChevronRight,
  Code2,
  GitCommit,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { NodeStateVersion } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useActivateVersion } from "~/features/workspace/hooks/useNodeActions";
import { useVersionDetail } from "~/features/workspace/hooks/useWorkflowData";

interface VersionReviewViewProps {
  nodeId: number;
  versionId: number;
  workflowId: number;
  isHistorical: boolean;
  nodeName: string;
}

function TimeTravelBanner({
  nodeId,
  version,
  workflowId,
}: {
  nodeId: number;
  version: NodeStateVersion;
  workflowId: number;
}) {
  const inspectVersion = useWorkspaceStore((state) => state.inspectVersion);
  const activateVersionMutation = useActivateVersion();

  const handleActivate = () => {
    activateVersionMutation.mutate(
      {
        nodeId,
        versionId: version.id,
        workflowId,
        versionNumber: version.version_number,
      },
      {
        onSuccess: () => {
          inspectVersion(null);
        },
      },
    );
  };

  return (
    <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-full border border-primary/20 bg-background/80 p-2 pl-4 text-sm shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <p>You are viewing a historical version.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => inspectVersion(null)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Active View
        </Button>
        <Button
          size="sm"
          onClick={handleActivate}
          disabled={activateVersionMutation.isPending}
        >
          {activateVersionMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Activate This Version
        </Button>
      </div>
    </div>
  );
}

export function VersionReviewView({
  nodeId,
  versionId,
  workflowId,
  isHistorical,
  nodeName,
}: VersionReviewViewProps) {
  const {
    data: version,
    isLoading,
    isError,
    error,
  } = useVersionDetail(nodeId, versionId);

  const { focusNode, inspectVersion } = useWorkspaceStore(
    useShallow((state) => ({
      focusNode: state.focusNode,
      inspectVersion: state.inspectVersion,
    })),
  );

  const handleDependencyClick = (
    upstreamNodeId: string,
    upstreamVersionId: number,
  ) => {
    focusNode(Number(upstreamNodeId));
    inspectVersion(upstreamVersionId);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Loading version details...</p>
      </div>
    );
  }

  if (isError || !version) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load version details.</p>
        <p className="text-xs text-destructive/80">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const title = isHistorical
    ? `Reviewing v${version.version_number} of "${nodeName}"`
    : `Active Version (v${version.version_number}) of "${nodeName}"`;

  return (
    <div className="relative h-full w-full">
      {isHistorical && (
        <TimeTravelBanner
          nodeId={nodeId}
          version={version}
          workflowId={workflowId}
        />
      )}
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-4xl space-y-6 p-8 pt-10 md:pt-20">
          <h1 className="text-2xl font-semibold">{title}</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Book className="h-4 w-4" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {version.summary ?? "No summary provided."}
              </p>
            </CardContent>
          </Card>

          {Object.keys(version.input_versions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitCommit className="h-4 w-4" /> Input Dependencies
                </CardTitle>
                <CardDescription>
                  This version was generated using these specific upstream
                  versions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(version.input_versions).map(
                    ([upstreamNodeId, upstreamVersionId]) => (
                      <li key={upstreamNodeId}>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-sm"
                          onClick={() =>
                            handleDependencyClick(
                              upstreamNodeId,
                              upstreamVersionId,
                            )
                          }
                        >
                          Input from Node {upstreamNodeId}
                          <ChevronRight className="h-4 w-4" />
                          Version {upstreamVersionId}
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="h-4 w-4" /> Final Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[500px] overflow-auto rounded-md bg-muted/50 p-4 text-xs">
                {JSON.stringify(version.output_data, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {version.hitl_records?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" /> HITL Interaction
                  History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[500px] overflow-auto rounded-md bg-muted/50 p-4 text-xs">
                  {JSON.stringify(version.hitl_records, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

```

### features/workspace/canvas/views/ManualEditorView.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertTriangle, FileJson, Save, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import type { NodeDetailView } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useManualEdit } from "~/features/workspace/hooks/useNodeActions";

const coerceValue = (text: string, originalValue: unknown): unknown => {
  if (typeof originalValue === "number") {
    const num = Number.parseFloat(text);
    return Number.isNaN(num) ? text : num;
  }
  if (typeof originalValue === "boolean") {
    const normalized = text.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
    return text;
  }
  return text;
};

interface EditableFieldProps {
  fieldKey: string;
  initialValue: unknown;
  onUpdate: (key: string, value: unknown, isValid: boolean) => void;
  isPending: boolean;
}

function EditableField({
  fieldKey,
  initialValue,
  onUpdate,
  isPending,
}: EditableFieldProps) {
  const isComplex =
    initialValue !== null && typeof initialValue === "object";
  const getInitialText = () => {
    if (isComplex) {
      return JSON.stringify(initialValue, null, 2);
    }
    if (
      typeof initialValue === "string" ||
      typeof initialValue === "number" ||
      typeof initialValue === "boolean"
    ) {
      return String(initialValue);
    }
    return "";
  };
  const [textValue, setTextValue] = React.useState(getInitialText);
  const [isValid, setIsValid] = React.useState(true);

  const debouncedOnUpdate = useDebouncedCallback(onUpdate, 300);

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const newText = event.target.value;
    setTextValue(newText);

    if (isComplex) {
      try {
        const parsed = JSON.parse(newText);
        setIsValid(true);
        debouncedOnUpdate(fieldKey, parsed, true);
      } catch {
        setIsValid(false);
        debouncedOnUpdate(fieldKey, null, false);
      }
    } else {
      const coerced = coerceValue(newText, initialValue);
      debouncedOnUpdate(fieldKey, coerced, true);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey} className="flex items-center gap-2 font-mono">
        {fieldKey}
        {!isValid && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" /> Invalid JSON
          </span>
        )}
      </Label>
      <Textarea
        id={fieldKey}
        value={textValue}
        onChange={handleChange}
        disabled={isPending}
        className="min-h-24 font-mono text-xs"
        data-invalid={!isValid}
      />
    </div>
  );
}

interface ManualEditorViewProps {
  node: NodeDetailView;
  workflowId: number;
}

export function ManualEditorView({ node, workflowId }: ManualEditorViewProps) {
  const stopEditing = useWorkspaceStore((state) => state.stopEditingNode);
  const { mutate: save, isPending } = useManualEdit(workflowId);

  const initialData = node.active_version?.output_data ?? {};
  const [editedData, setEditedData] = React.useState(initialData);
  const [validationState, setValidationState] = React.useState<
    Record<string, boolean>
  >(() =>
    Object.keys(initialData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<string, boolean>,
    ),
  );
  const [summary, setSummary] = React.useState("");

  const handleFieldUpdate = React.useCallback(
    (key: string, value: unknown, isValid: boolean) => {
      if (isValid) {
        setEditedData((prev) => ({ ...prev, [key]: value }));
      }
      setValidationState((prev) => ({ ...prev, [key]: isValid }));
    },
    [],
  );

  const allFieldsValid =
    Object.values(validationState).length === 0 ||
    Object.values(validationState).every((v) => v === true);

  const handleSave = () => {
    if (!allFieldsValid) {
      toast.error("Invalid data", {
        description: "Please correct the invalid fields before saving.",
      });
      return;
    }

    const baseVersionId = node.active_version?.id;
    if (!baseVersionId) {
      toast.error("Missing base version", {
        description: "Cannot save an edit without a base version to branch from.",
      });
      return;
    }

    save(
      {
        nodeId: node.id,
        payload: {
          base_version_id: baseVersionId,
          edited_output_data: editedData,
          summary: summary.trim() || "Manually edited output.",
        },
      },
      {
        onSuccess: () => {
          stopEditing();
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col bg-background p-6">
      <header className="mb-4 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <FileJson />
            Manually Editing: <span className="text-primary">{node.name}</span>
          </h2>
          <p className="text-muted-foreground">
            Directly modify the output fields. Your changes will create a new,
            manually sourced version.
          </p>
        </div>
      </header>
      <ScrollArea className="flex-1 pr-4">
        {Object.keys(initialData).length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No output fields available to edit.
          </div>
        ) : (
          <div className="grid gap-6">
            {Object.entries(initialData).map(([key, value]) => (
              <EditableField
                key={key}
                fieldKey={key}
                initialValue={value}
                onUpdate={handleFieldUpdate}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      <footer className="mt-4 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="summary">Edit Summary (Optional)</Label>
          <Input
            id="summary"
            placeholder="e.g., Corrected the problem statement for clarity."
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" onClick={stopEditing} disabled={isPending}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={!allFieldsValid || isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save as New Version"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

```

            ## hooks
             - useWorkflowData.ts
             - useNodeActions.ts

### features/workspace/hooks/useWorkflowData.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import { WorkflowService } from "~/core/api/services/workflow.service";
import type {
  NodeDetailView,
  NodeStateVersion,
  NodeVersionSummaryRead,
  StalenessReport,
  WorkflowInstanceRead,
} from "~/core/domain";

/**
 * Fetches the complete structure of a single workflow instance.
 * @param workflowId The ID of the workflow to fetch.
 * @param options Optional TanStack Query options.
 */
export const useWorkflow = (
  workflowId: number | null,
  options: Partial<UseQueryOptions<WorkflowInstanceRead>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.workflow(workflowId),
    queryFn: () => {
      // Type guard to keep the compiler satisfied even when enabled disables the query.
      if (workflowId === null) {
        return Promise.reject(new Error("Workflow ID is required."));
      }
      return WorkflowService.getDetail(workflowId);
    },
    enabled: !!workflowId,
    ...options,
  });
};

/**
 * Fetches the staleness report for a workflow.
 * @param workflowId The ID of the workflow to check.
 * @param options Optional TanStack Query options.
 */
export const useStalenessReport = (
  workflowId: number | null,
  options: Partial<UseQueryOptions<StalenessReport>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.staleness(workflowId),
    queryFn: () => {
      if (workflowId === null) {
        return Promise.reject(
          new Error("Workflow ID is required for staleness check."),
        );
      }
      return WorkflowService.getStaleness(workflowId);
    },
    enabled: !!workflowId,
    ...options,
  });
};

/**
 * Fetches the detailed information for a single node.
 * @param nodeId The ID of the node to fetch.
 * @param options Optional TanStack Query options.
 */
export const useNodeDetail = (
  nodeId: number | null,
  options: Partial<UseQueryOptions<NodeDetailView>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.node(nodeId),
    queryFn: () => {
      if (nodeId === null) {
        return Promise.reject(new Error("Node ID is required."));
      }
      return NodeService.getDetail(nodeId);
    },
    enabled: !!nodeId,
    ...options,
  });
};

/**
 * Fetches the list of all historical versions for a node.
 * @param nodeId The ID of the node.
 * @param options Optional TanStack Query options.
 */
export const useNodeVersions = (
  nodeId: number | null,
  options: Partial<UseQueryOptions<NodeVersionSummaryRead[]>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.nodeVersions(nodeId),
    queryFn: () => {
      if (nodeId === null) {
        return Promise.reject(new Error("Node ID is required for versions."));
      }
      return NodeService.getVersions(nodeId);
    },
    enabled: !!nodeId,
    ...options,
  });
};

/**
 * Fetches the complete snapshot of a specific historical version.
 * @param nodeId The ID of the parent node.
 * @param versionId The ID of the version to fetch.
 * @param options Optional TanStack Query options.
 */
export const useVersionDetail = (
  nodeId: number | null,
  versionId: number | null,
  options: Partial<UseQueryOptions<NodeStateVersion>> = {},
) => {
  return useQuery({
    queryKey: QueryKeys.versionDetail(nodeId, versionId),
    queryFn: () => {
      if (nodeId === null || versionId === null) {
        return Promise.reject(
          new Error("Node ID and Version ID are required."),
        );
      }
      return NodeService.getVersionDetail(nodeId, versionId);
    },
    enabled: !!nodeId && !!versionId,
    ...options,
  });
};

```

### features/workspace/hooks/useNodeActions.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import type {
  ExecutionRequest,
  ManualEditSubmission,
  NodeDetailView,
} from "~/core/domain";

/**
 * Creates a shared optimistic update handler for node execution actions.
 * @returns A partial `useMutation` options object.
 */
const useOptimisticNodeUpdate = () => {
  const queryClient = useQueryClient();

  return {
    onMutate: async (variables: { nodeId: number; payload: ExecutionRequest }) => {
      const { nodeId } = variables;
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: QueryKeys.node(nodeId) });

      // Snapshot the previous value
      const previousNode = queryClient.getQueryData<NodeDetailView>(
        QueryKeys.node(nodeId),
      );

      // Optimistically update to the new 'Executing' state, as per Design Doc 3.1.2.1
      if (previousNode) {
        queryClient.setQueryData<NodeDetailView>(QueryKeys.node(nodeId), {
          ...previousNode,
          status: "Executing",
          current_stage: "Queued", // 'Waking Up' visual state
          pending_result: null, // Clear previous failed result or old data
        });
      }

      return { previousNode };
    },
    onError: (
      err: ApiError,
      variables: { nodeId: number; payload: ExecutionRequest },
      context?: { previousNode?: NodeDetailView },
    ) => {
      // On error, roll back to the previous state
      if (context?.previousNode) {
        queryClient.setQueryData(
          QueryKeys.node(variables.nodeId),
          context.previousNode,
        );
      }
      toast.error(err.message || "Operation failed", {
        description: `Could not process node #${variables.nodeId}. Please check the node's state.`,
      });
    },
    onSettled: (
      data: unknown,
      error: Error | null,
      variables: { nodeId: number },
    ) => {
      // Invalidate after an error to ensure state is synced with the server.
      if (error) {
        void queryClient.invalidateQueries({
          queryKey: QueryKeys.node(variables.nodeId),
        });
      }
    },
  };
};

/**
 * Creates a mutation for re-executing a completed node.
 * Includes optimistic UI updates for immediate feedback.
 */
export const useReExecuteNode = () => {
  const optimisticUpdater = useOptimisticNodeUpdate();

  return useMutation({
    mutationFn: (variables: { nodeId: number; payload: ExecutionRequest }) =>
      NodeService.reExecute(variables.nodeId, variables.payload),
    ...optimisticUpdater,
    onSuccess: (data) => {
      toast.info(data.message);
    },
  });
};

/**
 * Creates a mutation for retrying a failed node.
 * Includes optimistic UI updates for immediate feedback.
 */
export const useRetryNode = () => {
  const optimisticUpdater = useOptimisticNodeUpdate();

  return useMutation({
    mutationFn: (variables: { nodeId: number; payload: ExecutionRequest }) =>
      NodeService.retry(variables.nodeId, variables.payload),
    ...optimisticUpdater,
    onSuccess: (data) => {
      toast.info(data.message);
    },
  });
};

/**
 * Creates a mutation for activating a historical version of a node.
 * Invalidates workflow and staleness caches to trigger the "ripple effect".
 */
export const useActivateVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      nodeId: number;
      versionId: number;
      workflowId: number;
      versionNumber: number;
    }) => NodeService.activateVersion(variables.nodeId, variables.versionId),
    onSuccess: (updatedNode, variables) => {
      const { nodeId, workflowId, versionNumber } = variables;

      void queryClient.invalidateQueries({
        queryKey: QueryKeys.staleness(workflowId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.node(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.nodeVersions(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });

      toast.success(
        `Version ${versionNumber} activated for node "${updatedNode.name}".`,
        {
          description: "Downstream nodes may now be stale.",
        },
      );
    },
    onError: (err: ApiError, variables) => {
      toast.error(err.message || "Failed to activate version", {
        description: `Could not activate version #${variables.versionId} for node #${variables.nodeId}. ${
          err.details ? JSON.stringify(err.details) : "The backend may have rejected the request."
        }`,
      });
    },
  });
};

/**
 * Creates a mutation for submitting a manual edit for a node.
 * Invalidates caches to reflect the new version and trigger the "ripple effect".
 */
export const useManualEdit = (workflowId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      nodeId: number;
      payload: ManualEditSubmission;
    }) => NodeService.manualEdit(variables.nodeId, variables.payload),
    onSuccess: (updatedNode, variables) => {
      const { nodeId } = variables;

      void queryClient.invalidateQueries({
        queryKey: QueryKeys.staleness(workflowId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.node(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.nodeVersions(nodeId),
      });
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(workflowId),
      });

      toast.success(
        `New manual version created for node "${updatedNode.name}".`,
      );
    },
    onError: (err: ApiError, variables) => {
      toast.error(err.message || "Failed to save manual edit.", {
        description: `Could not create a new version for node #${variables.nodeId}. ${
          err.details
            ? JSON.stringify(err.details)
            : "The backend may have rejected the request."
        }`,
      });
    },
  });
};

```

            ## navigator
             - StalenessIndicator.tsx
             - NodeListItem.tsx
             - README.md
             - NavigatorPanel.tsx

### features/workspace/navigator/StalenessIndicator.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { RefreshCcw } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useStalenessReport } from "~/features/workspace/hooks/useWorkflowData";
import { cn } from "~/lib/utils";

interface StalenessIndicatorProps {
  nodeId: number;
  workflowId: number;
  className?: string;
}

/**
 * Warns the user when the completed node's inputs are stale.
 * Mirrors the "State Overlays: Stale" pattern from Design Doc 3.1.2.1.
 */
export function StalenessIndicator({
  nodeId,
  workflowId,
  className,
}: StalenessIndicatorProps) {
  const { data: stalenessReport } = useStalenessReport(workflowId, {
    staleTime: 60 * 1000,
  });

  const staleInfo = stalenessReport?.[String(nodeId)];

  if (!staleInfo || staleInfo.length === 0) {
    return null;
  }

  const tooltipContent = staleInfo
    .map(
      (info) =>
        `Input from node ${info.upstream_definition_id} has changed. This result is based on v${info.consumed_version_id}, but the active version is now v${info.current_active_version_id}.`,
    )
    .join("\n");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            tabIndex={0}
            role="button"
            aria-label="Stale node warning"
            className={cn(
              "relative flex cursor-pointer items-center rounded-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          >
            <RefreshCcw className="h-4 w-4 text-amber-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="whitespace-pre-wrap">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

```

### features/workspace/navigator/NodeListItem.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Hand,
  Loader2,
  PauseCircle,
  Waves,
} from "lucide-react";
import { memo, useMemo } from "react";

import { BorderBeam } from "~/components/magicui/border-beam";
import { Button } from "~/components/ui/button";
import type { NodeInstanceRead } from "~/core/domain";
import { useWorkspaceStore, type WorkspaceState } from "~/core/store";
import { cn } from "~/lib/utils";

import { StalenessIndicator } from "./StalenessIndicator";

interface NodeListItemProps {
  node: NodeInstanceRead;
  workflowId: number;
}

type GlowConfig = {
  colorFrom: string;
  colorTo: string;
  duration: number;
  size?: number;
};

/**
 * Represents a single node in the Workflow Navigator and mirrors the
 * multi-state system defined in Design Doc 3.1.2.1.
 */
export const NodeListItem = memo(function NodeListItem({
  node,
  workflowId,
}: NodeListItemProps) {
  const focusedNodeId = useWorkspaceStore(
    (state: WorkspaceState) => state.focusedNodeId,
  );
  const focusNode = useWorkspaceStore(
    (state: WorkspaceState) => state.focusNode,
  );

  const isFocused = focusedNodeId === node.id;

  const visualState = useMemo(() => {
    let icon = Circle;
    let colorClass = "text-muted-foreground";
    let glow: GlowConfig | null = null;
    let iconAnimation = "";

    switch (node.status) {
      case "Not Started":
        icon = Circle;
        break;
      case "Executing":
        colorClass = "text-cyan-400";
        if (
          node.current_stage === "Queued" ||
          node.current_stage === "Initializing"
        ) {
          icon = Loader2;
          iconAnimation = "animate-spin";
          glow = {
            colorFrom: "hsl(var(--cyan-400))",
            colorTo: "hsl(var(--sky-500))",
            duration: 4,
          };
        } else {
          icon = Waves;
          iconAnimation = "animate-pulse";
          glow = {
            colorFrom: "hsl(var(--cyan-300))",
            colorTo: "hsl(var(--sky-400))",
            duration: 2,
            size: 80,
          };
        }
        break;
      case "Awaiting HITL Approval":
        if (isFocused) {
          icon = Hand;
          colorClass = "text-amber-400";
          glow = {
            colorFrom: "hsl(var(--amber-400))",
            colorTo: "hsl(var(--amber-500))",
            duration: 3,
          };
        } else {
          icon = PauseCircle;
          colorClass = "text-amber-500/80";
        }
        break;
      case "Completed":
        icon = CheckCircle;
        colorClass = "text-green-500";
        break;
      case "Failed":
        icon = AlertTriangle;
        colorClass = "text-red-500";
        glow = {
          colorFrom: "hsl(var(--red-500))",
          colorTo: "hsl(var(--red-600))",
          duration: 3,
        };
        break;
      default:
        icon = Circle;
        break;
    }

    return { icon, colorClass, glow, iconAnimation };
  }, [node.status, node.current_stage, isFocused]);

  const IconComponent = visualState.icon;

  return (
    <Button
      variant="ghost"
      className={cn(
        "relative h-auto w-full justify-start p-3 text-left transition-colors duration-200",
        isFocused && "bg-accent",
      )}
      onClick={() => focusNode(node.id)}
      aria-pressed={isFocused}
      data-node-id={node.id}
    >
      {visualState.glow && (
        <BorderBeam
          size={visualState.glow.size ?? 60}
          duration={visualState.glow.duration}
          delay={Math.random() * -2}
          colorFrom={visualState.glow.colorFrom}
          colorTo={visualState.glow.colorTo}
        />
      )}

      <IconComponent
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          visualState.colorClass,
          visualState.iconAnimation,
        )}
      />

      <div className="ml-3 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{node.name}</p>
        <p className="text-xs text-muted-foreground">{node.definition_id}</p>
      </div>

      {node.status === "Completed" && (
        <StalenessIndicator nodeId={node.id} workflowId={workflowId} />
      )}
    </Button>
  );
});

```

### features/workspace/navigator/NavigatorPanel.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkflow } from "~/features/workspace/hooks/useWorkflowData";
import { NodeListItem } from "./NodeListItem";

interface NavigatorPanelProps {
  workflowId: number;
}

/**
 * Left-side navigator for workflow nodes with animated updates.
 */
export function NavigatorPanel({ workflowId }: NavigatorPanelProps) {
  const {
    data: workflow,
    isLoading,
    isError,
    error,
  } = useWorkflow(workflowId);

  const sortedNodes = useMemo(() => {
    if (!workflow?.nodes) {
      return [];
    }
    return [...workflow.nodes].sort((a, b) => a.order_index - b.order_index);
  }, [workflow?.nodes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        <p>Failed to load workflow.</p>
        <p className="text-xs">
          {error instanceof Error ? error.message : String(error ?? "")}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <AnimatePresence>
        <motion.div
          className="space-y-1 p-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {sortedNodes.map((node) => (
            <motion.div key={node.id} layout variants={itemVariants}>
              <NodeListItem node={node} workflowId={workflowId} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </ScrollArea>
  );
}


```

        ## workflow-graph
         - README.md

            ## execution-view
             - layout.utils.ts
             - ExecutionNode.tsx
             - ExecutionGraph.tsx

### features/workflow-graph/execution-view/layout.utils.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { Edge, Node } from "@xyflow/react";
import dagre from "dagre";

const NODE_WIDTH = 260;
const NODE_HEIGHT = 140;

export interface LayoutOptions {
  rankdir?: "TB" | "BT" | "LR" | "RL";
}

/**
 * Applies Dagre layouting to the provided nodes and edges.
 */
export function getLayoutedElements<T extends Node>(
  nodes: T[],
  edges: Edge[],
  options: LayoutOptions = {},
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: options.rankdir ?? "LR",
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - NODE_HEIGHT / 2,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

```

### features/workflow-graph/execution-view/ExecutionNode.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Hand,
  Loader2,
  PauseCircle,
  Waves,
} from "lucide-react";
import { memo, useMemo } from "react";

import type { NodeInstanceRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { StalenessIndicator } from "~/features/workspace/navigator/StalenessIndicator";
import { cn } from "~/lib/utils";

export type ExecutionNodeData = NodeInstanceRead & {
  workflowId: number;
};

type VisualState = {
  icon: typeof Circle;
  accentClass: string;
  glowClass: string;
  iconAnimation?: string;
  badgeText: string;
};

/**
 * Custom React Flow node that mirrors the Navigator's visual logic,
 * ensuring a consistent mental model between the list and canvas views.
 */
export const ExecutionNode = memo(function ExecutionNode({
  data,
  id,
}: NodeProps<ExecutionNodeData>) {
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);
  const focusNode = useWorkspaceStore((state) => state.focusNode);

  const isFocused = focusedNodeId === data.id;

  const visualState = useMemo<VisualState>(() => {
    let icon = Circle;
    let accentClass = "from-muted/50 to-muted";
    let glowClass = "shadow-none";
    let badgeText = data.current_stage;
    let iconAnimation = "";

    switch (data.status) {
      case "Not Started":
        badgeText = "Not Started";
        break;
      case "Executing":
        accentClass = "from-cyan-400/30 to-sky-500/30";
        glowClass = "shadow-[0_0_25px_rgba(34,211,238,0.35)]";
        icon = data.current_stage.match(/Queued|Initializing/)
          ? Loader2
          : Waves;
        iconAnimation = data.current_stage.match(/Queued|Initializing/)
          ? "animate-spin"
          : "animate-pulse";
        badgeText = data.current_stage;
        break;
      case "Awaiting HITL Approval":
        accentClass = "from-amber-400/30 to-amber-500/20";
        icon = data.hitl_mode ? Hand : PauseCircle;
        badgeText = "Awaiting Approval";
        break;
      case "Completed":
        accentClass = "from-emerald-400/30 to-emerald-500/20";
        icon = CheckCircle;
        badgeText = "Completed";
        break;
      case "Failed":
        accentClass = "from-red-500/25 to-red-600/20";
        glowClass = "shadow-[0_0_30px_rgba(248,113,113,0.4)]";
        icon = AlertTriangle;
        badgeText = "Failed";
        break;
      default:
        break;
    }

    return { icon, accentClass, glowClass, badgeText, iconAnimation };
  }, [data.status, data.current_stage, data.hitl_mode]);

  const Icon = visualState.icon;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-muted-foreground/40 !bg-background"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => focusNode(data.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            focusNode(data.id);
          }
        }}
        className={cn(
          "group relative flex h-full min-h-[120px] w-full min-w-[220px] cursor-pointer flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 text-left transition",
          isFocused && "border-primary shadow-lg shadow-primary/20",
          visualState.glowClass,
        )}
      >
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            #{String(id).padStart(3, "0")}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground",
                isFocused && "text-primary",
              )}
            >
              {visualState.badgeText}
            </span>
            {data.status === "Completed" && (
              <StalenessIndicator
                nodeId={data.id}
                workflowId={data.workflowId}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br",
              visualState.accentClass,
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 text-primary",
                visualState.iconAnimation,
                data.status === "Failed" && "text-destructive",
                data.status === "Completed" && "text-emerald-500",
                data.status === "Executing" && "text-cyan-400",
                data.status === "Awaiting HITL Approval" &&
                  "text-amber-400 dark:text-amber-300",
              )}
            />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="truncate text-sm font-semibold">{data.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {data.definition_id}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{data.node_type}</span>
          <span>Order {data.order_index + 1}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-muted-foreground/40 !bg-background"
      />
    </>
  );
});

```

### features/workflow-graph/execution-view/ExecutionGraph.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { NodeInstanceRead, WorkflowInstanceRead } from "~/core/domain";
import { ExecutionNode, type ExecutionNodeData } from "./ExecutionNode";
import { getLayoutedElements } from "./layout.utils";

type WorkflowNodeWithDeps = NodeInstanceRead & {
  depends_on?: number[] | null;
};

const nodeTypes = {
  executionNode: ExecutionNode,
};

interface ExecutionGraphProps {
  workflow: WorkflowInstanceRead;
}

const buildEdges = (nodes: WorkflowNodeWithDeps[]): Edge[] => {
  const edges: Edge[] = [];
  const nodesWithDependencies = nodes.filter(
    (node) => node.depends_on && node.depends_on.length > 0,
  );

  if (nodesWithDependencies.length > 0) {
    nodes.forEach((node) => {
      const dependencies = node.depends_on ?? [];
      dependencies.forEach((parentId) => {
        edges.push({
          id: `e-${parentId}-${node.id}`,
          source: String(parentId),
          target: String(node.id),
          animated: node.status === "Executing",
        });
      });
    });
    return edges;
  }

  const sorted = [...nodes].sort((a, b) => a.order_index - b.order_index);
  for (let i = 1; i < sorted.length; i++) {
    const source = sorted[i - 1];
    const target = sorted[i];
    edges.push({
      id: `e-${source.id}-${target.id}`,
      source: String(source.id),
      target: String(target.id),
      animated: target.status === "Executing",
    });
  }
  return edges;
};

/**
 * Renders the main workflow graph (Screen 1), visualizing nodes
 * and dependencies with automatic Dagre layout.
 */
export function ExecutionGraph({ workflow }: ExecutionGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { nodes, edges } = useMemo(() => {
    if (!workflow?.nodes?.length) {
      return { nodes: [], edges: [] };
    }

    const reactFlowNodes: Node<ExecutionNodeData>[] = workflow.nodes.map(
      (node) => ({
        id: String(node.id),
        type: "executionNode",
        position: { x: 0, y: 0 },
        data: { ...node, workflowId: workflow.id },
        draggable: false,
      }),
    );

    const reactFlowEdges = buildEdges(workflow.nodes as WorkflowNodeWithDeps[]);

    return getLayoutedElements(reactFlowNodes, reactFlowEdges);
  }, [workflow]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const applySize = (width: number, height: number) => {
      setDimensions((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    };

    if (typeof ResizeObserver === "undefined") {
      const updateSize = () => {
        const rect = element.getBoundingClientRect();
        applySize(rect.width, rect.height);
      };
      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      applySize(width, height);
    });

    observer.observe(element);
    applySize(element.clientWidth, element.clientHeight);

    return () => observer.disconnect();
  }, []);

  const hasSize = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div ref={containerRef} className="h-full w-full">
      {hasSize ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.5}
          panOnScroll
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={36} size={1} color="hsl(var(--border))" />
          <Controls position="bottom-right" />
        </ReactFlow>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

```

        ## hitl
         - README.md
         - HITLController.tsx

### features/hitl/HITLController.tsx Content:

```tsx
import { useCallback, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { NodeDetailView } from "~/core/domain";

import { HITLActionBar } from "./components/HITLActionBar";
import { AVLInterface, type AVLData } from "./components/AVLInterface";
import { SCAInterface, type SCAData } from "./components/SCAInterface";
import { VARLInterface } from "./components/VARLInterface";
import { useSubmitHITL } from "./hooks/useHITL";

interface HITLControllerProps {
  node: NodeDetailView;
  workflowId: number;
}

export interface InteractionUpdate {
  data: Record<string, any> | null;
  isComplete: boolean;
}

export type InteractionHandler = (update: InteractionUpdate) => void;

export function HITLController({ node, workflowId }: HITLControllerProps) {
  const { mutate: submit, isPending: isSubmitting } = useSubmitHITL();

  const [interactionData, setInteractionData] = useState<Record<string, any> | null>(null);
  const [isInteractionComplete, setInteractionComplete] = useState(false);

  const handleInteractionChange = useCallback<InteractionHandler>((update) => {
    setInteractionData(update.data ?? null);
    setInteractionComplete(update.isComplete);
  }, []);

  const handleApprove = () => {
    submit({
      nodeId: node.id,
      workflowId,
      payload: {
        action: "Continue",
        interaction_data: interactionData,
      },
    });
  };

  const handleReject = (feedback: string) => {
    submit({
      nodeId: node.id,
      workflowId,
      payload: {
        action: "RejectAndProvideModificationComments",
        feedback_comment: feedback,
      },
    });
  };

  const handleDiscard = () => {
    submit({
      nodeId: node.id,
      workflowId,
      payload: {
        action: "Discard",
      },
    });
  };

  const renderContent = () => {
    switch (node.hitl_mode) {
      case "SCA":
        return (
          <SCAInterface
            data={node.pending_result?.output_data as SCAData}
            onInteractionChange={handleInteractionChange}
            allowMultiple={true}
          />
        );
      case "AVL":
        return (
          <AVLInterface
            data={node.pending_result?.output_data as AVLData}
            onInteractionChange={handleInteractionChange}
          />
        );
      case "VARL":
        return (
          <VARLInterface
            content={node.pending_result?.output_data}
            onInteractionChange={handleInteractionChange}
          />
        );
      default:
        return (
          <p className="text-sm text-destructive">
            Unknown HITL Mode: {node.hitl_mode}
          </p>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <Card className="mx-auto h-full max-w-4xl border-amber-400/50 bg-card shadow-lg shadow-amber-500/5">
          <CardHeader>
            <CardTitle>Decision Point: {node.name}</CardTitle>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
      <HITLActionBar
        onApprove={handleApprove}
        onReject={handleReject}
        onDiscard={handleDiscard}
        isSubmitting={isSubmitting}
        isApprovalDisabled={!isInteractionComplete}
      />
    </div>
  );
}

```

            ## components
             - AVLInterface.tsx
             - SCAInterface.tsx
             - HITLActionBar.tsx
             - VARLInterface.tsx

### features/hitl/components/AVLInterface.tsx Content:

```tsx
import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Markdown } from "~/components/deer-flow/markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

import type { InteractionHandler } from "../HITLController";

export interface Critique {
  id: string;
  content: string;
}

export interface AVLData {
  proposal: string;
  critiques: Critique[];
}

const adjudicationSchema = z.object({
  critique_id: z.string(),
  decision: z.enum(["Accepted", "Rejected"], {
    required_error: "A decision is required.",
  }),
  comment: z.string().optional(),
});

const formSchema = z.object({
  adjudications: z.array(adjudicationSchema).nonempty(),
});

interface AVLInterfaceProps {
  data: AVLData | null | undefined;
  onInteractionChange: InteractionHandler;
}

/**
 * Implements the AVL (Adversarial Validation Loop) HITL interface.
 * Guides reviewers through adjudicating critiques for a proposal.
 */
export function AVLInterface({ data, onInteractionChange }: AVLInterfaceProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjudications:
        data?.critiques.map((critique) => ({
          critique_id: critique.id,
          decision: undefined,
          comment: "",
        })) ?? [],
    },
    mode: "onChange",
  });

  const { formState, watch } = form;
  const adjudications = watch("adjudications");

  useEffect(() => {
    onInteractionChange({
      data: { adjudication: adjudications },
      isComplete: formState.isValid,
    });
  }, [adjudications, formState.isValid, onInteractionChange]);

  if (!data || !data.critiques || data.critiques.length === 0) {
    return <p className="text-muted-foreground">No proposal or critiques to display.</p>;
  }

  return (
    <div className="flex h-full flex-col gap-8">
      {data.proposal && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Core Proposal</h3>
          <div className="prose prose-sm max-w-none rounded-md border bg-background p-4 dark:prose-invert">
            <Markdown>{data.proposal}</Markdown>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Adjudicate Critiques</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Review and decide on each critique. The &quot;Approve&quot; button will be enabled once all
          critiques are addressed.
        </p>
        <Form {...form}>
          <form className="space-y-4">
            <Accordion type="multiple" className="w-full" defaultValue={data.critiques.map((c) => c.id)}>
              {data.critiques.map((critique, index) => (
                <AccordionItem value={critique.id} key={critique.id}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {critique.content}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 p-2">
                      <FormField
                        control={form.control}
                        name={`adjudications.${index}.decision`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={field.value === "Accepted" ? "default" : "outline"}
                                  onClick={() => field.onChange("Accepted")}
                                >
                                  Accept
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "Rejected" ? "destructive" : "outline"}
                                  onClick={() => field.onChange("Rejected")}
                                >
                                  Reject
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`adjudications.${index}.comment`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Optional: add a comment for your decision..."
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </form>
        </Form>
      </div>
    </div>
  );
}

```

### features/hitl/components/SCAInterface.tsx Content:

```tsx
import { useEffect, useState } from "react";

import { Markdown } from "~/components/deer-flow/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

import type { InteractionHandler } from "../HITLController";

// Represents a candidate based on API Doc 5.1.1 `pending_result` example.
export interface Candidate {
  id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

// Expected data structure for SCA interactions.
export interface SCAData {
  candidates: Candidate[];
  comparative_analysis: string;
}

interface SCAInterfaceProps {
  data: SCAData | null | undefined;
  onInteractionChange: InteractionHandler;
  allowMultiple?: boolean;
}

/**
 * Implements the SCA (Strategic Choice Architecture) HITL interface.
 * Presents a comparative analysis and lets reviewers select preferred strategies.
 */
export function SCAInterface({
  data,
  onInteractionChange,
  allowMultiple = true,
}: SCAInterfaceProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    onInteractionChange({
      data: { selected_ids: selectedIds },
      isComplete: selectedIds.length > 0,
    });
  }, [selectedIds, onInteractionChange]);

  const handleSelect = (candidateId: string) => {
    setSelectedIds((prev) => {
      if (allowMultiple) {
        return prev.includes(candidateId)
          ? prev.filter((id) => id !== candidateId)
          : [...prev, candidateId];
      }
      return prev.includes(candidateId) ? [] : [candidateId];
    });
  };

  if (!data || !data.candidates || data.candidates.length === 0) {
    return (
      <p className="text-muted-foreground">No candidate strategies to display.</p>
    );
  }

  return (
    <div className="flex h-full flex-col gap-8">
      {data.comparative_analysis && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Comparative Analysis</h3>
          <div className="prose prose-sm max-w-none rounded-md border bg-background p-4 dark:prose-invert">
            <Markdown>{data.comparative_analysis}</Markdown>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Select Preferred Strategy/ies</h3>
        <ScrollArea className="w-full">
          <div className="flex w-max space-x-4 p-1">
            {data.candidates.map((candidate) => {
              const isSelected = selectedIds.includes(candidate.id);
              return (
                <Card
                  key={candidate.id}
                  className={cn(
                    "w-72 cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-cyan-400 ring-2 ring-cyan-400/50",
                  )}
                  onClick={() => handleSelect(candidate.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base">{candidate.name}</CardTitle>
                      <Checkbox
                        checked={isSelected}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={() => handleSelect(candidate.id)}
                        aria-label={`Select ${candidate.name}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {candidate.description ||
                        `Details for strategy ${candidate.id}.`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

```

### features/hitl/components/HITLActionBar.tsx Content:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

interface HITLActionBarProps {
  onApprove: () => void;
  onReject: (feedback: string) => void;
  onDiscard: () => void;
  isSubmitting: boolean;
  isApprovalDisabled?: boolean;
}

const rejectSchema = z.object({
  feedback_comment: z
    .string()
    .min(10, {
      message: "Please provide detailed feedback (min. 10 characters).",
    }),
});

export function HITLActionBar({
  onApprove,
  onReject,
  onDiscard,
  isSubmitting,
  isApprovalDisabled = false,
}: HITLActionBarProps) {
  const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setDiscardDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof rejectSchema>>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { feedback_comment: "" },
  });

  const handleRejectSubmit = (values: z.infer<typeof rejectSchema>) => {
    onReject(values.feedback_comment);
    setRejectDialogOpen(false);
    form.reset();
  };

  const handleDiscardConfirm = () => {
    onDiscard();
    setDiscardDialogOpen(false);
  };

  return (
    <div className="flex w-full items-center justify-center gap-4 border-t bg-background/80 p-4 backdrop-blur-sm">
      <Dialog open={isDiscardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" disabled={isSubmitting}>
            Discard
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm discarding this execution?</DialogTitle>
            <DialogDescription>
              This will permanently discard all temporary results from this
              execution attempt. The node will revert to its previous state.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDiscardDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscardConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Discard"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isSubmitting}>
            Reject and Provide Modification Comments
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRejectSubmit)}>
              <DialogHeader>
                <DialogTitle>Provide Modification Comments</DialogTitle>
                <DialogDescription>
                  Your feedback will guide the AI to generate a better result in
                  the next round.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FormField
                  control={form.control}
                  name="feedback_comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        Feedback Comment
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Focus more on the scalability aspect and provide a cost analysis...'"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Feedback and Regenerate"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Button
        onClick={onApprove}
        disabled={isSubmitting || isApprovalDisabled}
        className="min-w-48"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Approve and Continue"
        )}
      </Button>
    </div>
  );
}

```

### features/hitl/components/VARLInterface.tsx Content:

```tsx
import { Fragment, useEffect } from "react";

import { Markdown } from "~/components/deer-flow/markdown";

import type { InteractionHandler } from "../HITLController";

interface VARLInterfaceProps {
  content: Record<string, unknown> | string | unknown[] | null | undefined;
  onInteractionChange: InteractionHandler;
}

/**
 * Implements the VARL (Vetting and Review Loop) HITL interface.
 * Used for lightweight review-and-approve scenarios.
 */
export function VARLInterface({
  content,
  onInteractionChange,
}: VARLInterfaceProps) {
  useEffect(() => {
    // VARL interactions complete as soon as the reviewer sees the content.
    onInteractionChange({ data: {}, isComplete: true });
  }, [onInteractionChange]);

  const renderContent = () => {
    if (!content) {
      return (
        <p className="text-muted-foreground">No content available for review.</p>
      );
    }

    if (typeof content === "string") {
      return <Markdown>{content}</Markdown>;
    }

    if (Array.isArray(content)) {
      return (
        <ul className="list-disc space-y-1 pl-6">
          {content.map((item, index) => (
            <li key={index}>
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof content === "object") {
      return (
        <dl className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-2">
          {Object.entries(content as Record<string, unknown>).map(
            ([key, value]) => (
              <Fragment key={key}>
                <dt className="font-semibold">{key}:</dt>
                <dd>
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </dd>
              </Fragment>
            ),
          )}
        </dl>
      );
    }

    return (
      <pre className="w-full overflow-auto rounded-md bg-muted/50 p-4 text-xs">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  };

  return <div className="prose prose-sm max-w-none dark:prose-invert">{renderContent()}</div>;
}

```

            ## hooks
             - useHITL.ts

### features/hitl/hooks/useHITL.ts Content:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import { NodeService } from "~/core/api/services/node.service";
import type { HITLSubmission } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";

/**
 * Creates a mutation for submitting a HITL decision for a node.
 * Encapsulates request logic plus cache invalidation and workspace navigation.
 */
export const useSubmitHITL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      nodeId: number;
      workflowId: number;
      payload: HITLSubmission;
    }) => NodeService.submitHITL(variables.nodeId, variables.payload),

    onSuccess: (data, variables) => {
      const { nodeId, workflowId } = variables;
      toast.success(data.message);

      switch (data.action) {
        case "ExecuteNext":
        case "NavigateNext":
          if (data.next_node_id) {
            useWorkspaceStore.getState().focusNode(data.next_node_id);
          }
          break;

        case "Completed":
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.node(nodeId),
          });
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.workflow(workflowId),
          });
          break;

        case "AVLLoop":
        case "ReExecute":
          // Backend realtime events will update the UI; no action required here.
          break;

        case "Discarded":
          toast.info("Execution has been discarded.");
          void queryClient.invalidateQueries({
            queryKey: QueryKeys.node(nodeId),
          });
          break;

        default:
          break;
      }
    },

    onError: (error) => {
      const description =
        error instanceof ApiError
          ? error.message
          : "An unknown error occurred.";
      toast.error("Failed to submit decision", { description });
    },
  });
};

```

        ## dashboard
         - README.md

            ## components
             - CreateProjectDialog.tsx
             - ProjectDashboardClient.tsx
             - ProjectCardSkeleton.tsx
             - ProjectCard.tsx
             - EmptyState.tsx

### features/dashboard/components/CreateProjectDialog.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useCreateProject } from "~/features/dashboard/hooks/useProjects";
import { useRouter } from "~/navigation";

const formSchema = z.object({
  name: z.string().min(1, { message: "Project name is required." }).max(120),
  description: z.string().max(500).optional(),
});

type ProjectFormValues = z.infer<typeof formSchema>;

interface CreateProjectDialogProps {
  trigger: ReactNode;
}

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const createProjectMutation = useCreateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const newProject = await createProjectMutation.mutateAsync(data);
      form.reset();
      setIsOpen(false);
      router.push(`/projects/${newProject.id}/config`);
    } catch {
      // Errors are already surfaced via the mutation hook toast handler.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your project a name and optional description. You can change
            these later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2024 Modeling Challenge"
                      data-testid="create-project-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a short note about goals or constraints."
                      data-testid="create-project-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

```

### features/dashboard/components/ProjectDashboardClient.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertCircle, PlusIcon, RefreshCcw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useProjectList } from "~/features/dashboard/hooks/useProjects";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { EmptyState } from "./EmptyState";
import { ProjectCard } from "./ProjectCard";
import { ProjectCardSkeleton } from "./ProjectCardSkeleton";

export function ProjectDashboardClient() {
  const { data, isLoading, isError, refetch, error } = useProjectList({
    limit: 100,
  });
  const hasProjects = !isLoading && (data?.items.length ?? 0) > 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "We couldn’t load your projects. Please try again."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      );
    }

    if (!hasProjects) {
      return <EmptyState />;
    }

    return (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.items.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto flex h-full flex-col p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your modeling workspaces and monitor workflow progress.
          </p>
        </div>
        {hasProjects && (
          <CreateProjectDialog
            trigger={
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Project
              </Button>
            }
          />
        )}
      </header>
      <main className="flex flex-grow">{renderContent()}</main>
    </div>
  );
}

```

### features/dashboard/components/ProjectCardSkeleton.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

```

### features/dashboard/components/ProjectCard.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { CalendarDays, ChevronRight } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ProjectStatus, ProjectSummaryRead } from "~/core/domain";
import { Link } from "~/navigation";

const statusCopy: Record<
  ProjectStatus,
  { badgeClass: string; label: string; helper: string }
> = {
  Configuring: {
    label: "Configuring",
    helper: "Finish setup to start the workflow.",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-500/20",
  },
  Running: {
    label: "Running",
    helper: "Workflow in progress. Monitor in Flow view.",
    badgeClass: "bg-sky-100 text-sky-900 dark:bg-sky-500/20",
  },
  Completed: {
    label: "Completed",
    helper: "View artifacts and download results.",
    badgeClass: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

interface ProjectCardProps {
  project: ProjectSummaryRead;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusCopy[project.status];
  const href =
    project.status === "Configuring"
      ? `/projects/${project.id}/config`
      : `/projects/${project.id}/flow`;

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
      prefetch={false}
    >
      <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className={status.badgeClass}>
              {status.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Problem {project.problem_type}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-xl">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p>{status.helper}</p>
            <div className="flex items-center gap-1 text-xs uppercase tracking-wide">
              <CalendarDays className="h-4 w-4" />
              <span>Updated {dateFormatter.format(new Date(project.updated_at))}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}

```

### features/dashboard/components/EmptyState.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

import { CreateProjectDialog } from "./CreateProjectDialog";

export function EmptyState() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-10 text-center">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Project Dashboard
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Start your first modeling project
          </h2>
          <p className="text-base text-muted-foreground">
            Create a project to configure data sources, manage workflows, and
            collaborate with your team in one place.
          </p>
        </div>
        <CreateProjectDialog
          trigger={
            <Button size="lg">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />
      </div>
    </section>
  );
}

```

            ## hooks
             - useProjects.ts

### features/dashboard/hooks/useProjects.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "~/core/api/client";
import { QueryKeys } from "~/core/api/queryKeys";
import {
  ProjectService,
  type HistoricalInitializationRequest,
  type ProjectCreate,
  type ProjectUpdate,
} from "~/core/api/services/project.service";
import type { FileRole, ProjectDetailRead } from "~/core/domain";

/**
 * Fetches a paginated list of projects.
 */
export const useProjectList = (
  params: { skip?: number; limit?: number },
  options: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof ProjectService.getList>>>
  > = {},
) => {
  return useQuery({
    queryKey: [...QueryKeys.projects(), params] as const,
    queryFn: () => ProjectService.getList(params),
    ...options,
  });
};

/**
 * Fetches the detailed information for a single project.
 */
export const useProjectDetail = (
  projectId: number | null,
  options: Partial<UseQueryOptions<ProjectDetailRead>> = {},
) => {
  const { enabled, ...restOptions } = options;
  const isValidProjectId =
    typeof projectId === "number" && Number.isFinite(projectId);

  return useQuery({
    queryKey: QueryKeys.projectDetail(projectId),
    queryFn: () => {
      if (!isValidProjectId || projectId === null) {
        throw new Error("A valid project id is required to fetch details.");
      }
      return ProjectService.getDetail(projectId);
    },
    enabled: isValidProjectId && (enabled ?? true),
    ...restOptions,
  });
};

/**
 * Creates a mutation for adding a new project.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectCreate) => ProjectService.create(payload),
    onSuccess: (newProject) => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      toast.success(`Project "${newProject.name}" created successfully.`);
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "An unknown error occurred.";
      toast.error("Failed to create project", { description });
    },
  });
};

/**
 * Creates a mutation for updating a project.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { projectId: number; payload: ProjectUpdate }) =>
      ProjectService.update(variables.projectId, variables.payload),
    onSuccess: (updatedProject) => {
      // Update the specific project's cache directly for an immediate UI update.
      queryClient.setQueryData(
        QueryKeys.projectDetail(updatedProject.id),
        updatedProject,
      );
      // Invalidate the list to reflect changes there.
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      toast.success("Project updated successfully.");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "An unknown error occurred.";
      toast.error("Failed to update project", { description });
    },
  });
};

/**
 * Creates a mutation for deleting a project.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => ProjectService.delete(projectId),
    onSuccess: (_, projectId) => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      void queryClient.removeQueries({
        queryKey: QueryKeys.projectDetail(projectId),
      });
      toast.success("Project deleted successfully.");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "An unknown error occurred.";
      toast.error("Failed to delete project", { description });
    },
  });
};

/**
 * Creates a mutation for uploading a file to a project.
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      projectId: number;
      file: File;
      role: FileRole;
    }) =>
      ProjectService.uploadFile(
        variables.projectId,
        variables.file,
        variables.role,
      ),
    onSuccess: (newFile, variables) => {
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.projectDetail(variables.projectId),
      });
      toast.success(`File "${newFile.filename}" uploaded successfully.`);
    },
    onError: (error) => {
      toast.error("File upload failed", {
        description:
          error instanceof ApiError ? error.message : "An unknown error occurred.",
      });
    },
  });
};

/**
 * Creates a mutation for initializing a project from a historical problem.
 */
export const useInitializeFromHistorical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      projectId: number;
      payload: HistoricalInitializationRequest;
    }) =>
      ProjectService.initializeFromHistorical(
        variables.projectId,
        variables.payload,
      ),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(
        QueryKeys.projectDetail(updatedProject.id),
        updatedProject,
      );
      toast.success("Project initialized from historical problem.");
    },
    onError: (error) => {
      toast.error("Failed to initialize project", {
        description:
          error instanceof ApiError ? error.message : "An unknown error occurred.",
      });
    },
  });
};

/**
 * Creates a mutation for starting a project's workflow.
 */
export const useStartWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => ProjectService.startWorkflow(projectId),
    onSuccess: (_, projectId) => {
      void queryClient.invalidateQueries({
        queryKey: QueryKeys.projectDetail(projectId),
      });
      void queryClient.invalidateQueries({ queryKey: QueryKeys.projects() });
      toast.info("Workflow has been started.");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError
          ? error.message
          : "An unknown error occurred.";
      toast.error("Failed to start workflow", { description });
    },
  });
};

/**
 * Creates a mutation for exporting a project and triggers a download.
 */
export const useExportProject = () => {
  return useMutation({
    mutationFn: (variables: { projectId: number; projectName: string }) =>
      ProjectService.exportProject(variables.projectId),
    onSuccess: (blob, variables) => {
      const filename = `${variables.projectName.replace(/\s+/g, "_")}_export.zip`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("Project export has started.");
    },
    onError: (error) => {
      toast.error("Failed to export project", {
        description:
          error instanceof ApiError
            ? error.message
            : "An unknown error occurred.",
      });
    },
  });
};

/**
 * Fetches the list of all historical problems for initialization.
 */
export const useHistoricalProblems = () => {
  return useQuery({
    queryKey: QueryKeys.historicalProblems(),
    queryFn: ProjectService.getHistoricalProblems,
  });
};

```

        ## system

            ## hooks
             - useSystem.ts

### features/system/hooks/useSystem.ts Content:

```ts
import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "~/core/api/queryKeys";
import { SystemService } from "~/core/api/services/system.service";

export const useSystemInfo = () => {
  return useQuery({
    queryKey: QueryKeys.systemInfo(),
    queryFn: SystemService.getInfo,
    staleTime: 5 * 60 * 1000,
  });
};

```

        ## versioning
         - README.md

        ## authentication
         - LoginForm.tsx
         - RegisterForm.tsx
         - README.md

### features/authentication/LoginForm.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/core/auth/hooks";
import { Link } from "~/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, error: authError } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };

  return (
    <Card className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your Cognitive Cockpit</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="user@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {authError && (
              <p className="text-sm font-medium text-destructive">{authError}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

```

### features/authentication/RegisterForm.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ApiError } from "~/core/api/client";
import { AuthService } from "~/core/api/services/auth.service";
import { Link, useRouter } from "~/navigation";

// Schema for registration form validation based on API requirements.
const registerSchema = z
  .object({
    displayName: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await AuthService.register({
        email: data.email,
        password: data.password,
        display_name: data.displayName,
      });
      toast.success("Registration successful!", {
        description: "Please sign in to continue.",
      });
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError("email", {
          type: "manual",
          message: "An account with this email already exists.",
        });
      } else {
        toast.error("Registration Failed", {
          description:
            error instanceof Error ? error.message : "An unexpected error occurred.",
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Join the Cognitive Cockpit to start your analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="user@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign Up
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

```

            ## components
             - UserNav.tsx

### features/authentication/components/UserNav.tsx Content:

```tsx
"use client";

import { LogOut, Settings } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuth } from "~/core/auth/hooks";
import type { UserRead } from "~/core/domain";
import { Link, useRouter } from "~/navigation";

interface UserNavProps {
  user: UserRead;
}

const getInitials = (value: string) => {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]!.toUpperCase())
    .join("");
};

export function UserNav({ user }: UserNavProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const initials =
    getInitials(user.display_name ?? "") ||
    user.email.charAt(0).toUpperCase() ||
    "?";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-2.5 py-1"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
            {initials}
          </span>
          <span className="hidden text-sm font-medium sm:inline">
            {user.display_name ?? user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">
            {user.display_name ?? "Your account"}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```

    ## styles
     - prosemirror.css
     - globals.css

    ## components
     - theme-provider.tsx
     - AppProviders.tsx

        ## ui
         - tabs.tsx
         - card.tsx
         - slider.tsx
         - popover.tsx
         - sheet.tsx
         - scroll-area.tsx
         - resizable.tsx
         - label.tsx
         - accordion.tsx
         - tooltip.tsx
         - switch.tsx
         - command.tsx
         - dialog.tsx
         - badge.tsx
         - separator.tsx
         - button.tsx
         - checkbox.tsx
         - collapsible.tsx
         - dropdown-menu.tsx
         - select.tsx
         - textarea.tsx
         - input.tsx
         - skeleton.tsx
         - form.tsx

            ## icons
             - magic.tsx

        ## deer-flow
         - rainbow-text.tsx
         - link.tsx
         - loading-animation.tsx
         - rolling-text.tsx
         - toaster.tsx
         - markdown.tsx
         - fav-icon.tsx
         - loading-animation.module.css
         - tooltip.tsx
         - theme-provider-wrapper.tsx
         - logo.tsx
         - language-switcher.tsx
         - image.tsx
         - theme-toggle.tsx
         - rainbow-text.module.css
         - scroll-container.tsx

### components/deer-flow/language-switcher.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { usePathname, useRouter } from "~/navigation";

type LanguageOption = {
  code: string;
  name: string;
  flag: string;
};

const languages: Array<LanguageOption> = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLanguage =
    languages.find((lang) => lang.code === locale) ??
    (languages[0] as LanguageOption);

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <span className="mr-2">{currentLanguage.flag}</span>
          {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={locale === language.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```

            ## icons
             - detective.tsx
             - report-style.tsx
             - enhance.tsx

        ## magicui
         - shine-border.tsx
         - aurora-text.tsx
         - border-beam.tsx
         - number-ticker.tsx
         - flickering-grid.tsx
         - bento-grid.tsx

    ## hooks
     - use-intersection-observer.ts
     - use-mobile.ts

    ## lib
     - utils.ts
     - queryClient.ts

