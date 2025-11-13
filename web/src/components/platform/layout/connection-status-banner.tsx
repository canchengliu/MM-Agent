"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";

import { useStore } from "~/core/store";
import { ConnectionStatus } from "~/core/store/slices/connection-status.slice";
import { cn } from "~/lib/utils";

export function ConnectionStatusBanner() {
  const { status, isSubscribed, isSyncing } = useStore(
    useShallow((state) => ({
      status: state.wsStatus,
      isSubscribed: state.isSubscribed,
      isSyncing: state.isSyncing,
    })),
  );

  const isStable =
    status === ConnectionStatus.Connected ||
    status === ConnectionStatus.Disconnected;
  const isVisible = isSubscribed && (!isStable || isSyncing);

  let title = "";
  let icon: JSX.Element | null = null;
  let severity: "info" | "error" | "warning" = "info";

  if (isSyncing) {
    title = "Synchronizing application state...";
    icon = <Loader2 className="h-4 w-4 animate-spin" />;
  } else {
    switch (status) {
      case ConnectionStatus.Connecting:
        title = "Connecting to real-time updates...";
        icon = <Loader2 className="h-4 w-4 animate-spin" />;
        break;
      case ConnectionStatus.Reconnecting:
        title = "Connection lost. Attempting to reconnect...";
        icon = <Loader2 className="h-4 w-4 animate-spin" />;
        severity = "warning";
        break;
      case ConnectionStatus.Error:
        title = "Real-time connection failed.";
        icon = <AlertCircle className="h-4 w-4" />;
        severity = "error";
        break;
      default:
        break;
    }
  }

  return (
    <AnimatePresence>
      {isVisible && title && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="z-30 overflow-hidden shadow-md"
          role="alert"
          aria-live="assertive"
        >
          <div
            className={cn(
              "flex items-center justify-center gap-4 border-b p-2 text-sm font-medium backdrop-blur-sm",
              severity === "warning" &&
                "border-amber-800/50 bg-amber-500/15 text-amber-500",
              severity === "info" &&
                "border-blue-800/50 bg-blue-500/15 text-blue-500",
              severity === "error" &&
                "border-red-800/50 bg-red-500/15 text-red-400",
            )}
          >
            {icon}
            <span>{title}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
