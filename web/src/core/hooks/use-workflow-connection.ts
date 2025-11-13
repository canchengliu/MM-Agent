import { useEffect } from "react";

import { useStore } from "~/core/store";
import { webSocketManager } from "~/core/websocket/manager";

export function useWorkflowConnection(
  workflowId: number | null | undefined,
): void {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (workflowId && isAuthenticated) {
      console.log(
        `[useWorkflowConnection] Mounting for workflow ${workflowId}. Initiating connection.`,
      );
      webSocketManager.connect(workflowId);
    }

    return () => {
      if (workflowId && isAuthenticated) {
        console.log(
          `[useWorkflowConnection] Unmounting or changing context. Disconnecting workflow ${workflowId}.`,
        );
        webSocketManager.disconnect();
      }
    };
  }, [workflowId, isAuthenticated]);
}
