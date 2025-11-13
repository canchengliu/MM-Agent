// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
// We import the MonacoWrapper which already handles dynamic loading internally.
import MonacoWrapper from './MonacoWrapper';
import type { editor } from 'monaco-editor';
import { Button } from '~/components/ui/button';
import { ArrowDownToLine } from 'lucide-react';
import { cn } from '~/lib/utils';

interface LogViewerProps {
  logs: string; // The full log content
  className?: string;
}

/**
 * LogViewer component optimized for displaying real-time logs with auto-scrolling capabilities.
 * Implements requirements from Design Doc 3.1.1.A.3 (Live Log Viewer).
 */
export const LogViewer: React.FC<LogViewerProps> = ({ logs, className }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  // Design Doc 3.1.1.A.3: Default automatic scroll to the bottom
  const [autoScroll, setAutoScroll] = useState(true);
  // State to track if the user has manually scrolled up (to show the button)
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Function to scroll the editor to the very bottom
  const scrollToBottom = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      const model = editor.getModel();
      if (model) {
        const lineCount = model.getLineCount();
        // Reveal the last line. 0 (ScrollType.Immediate) ensures immediate scroll.
        editor.revealLine(lineCount, 0);
      }
    }
  }, []);

  // Effect: Auto-scroll when logs update, provided autoScroll is enabled
  useEffect(() => {
    // If autoScroll is true (meaning user is at the bottom or hasn't intervened), scroll down on log updates.
    if (autoScroll && editorRef.current) {
      scrollToBottom();
    }
  }, [logs, autoScroll, scrollToBottom]);

  // Handle editor mount and setup scroll listeners
  const handleMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;

    // Listener for scroll events within Monaco to detect user interaction
    editorInstance.onDidScrollChange((e) => {
      // Only react if the vertical scroll position or the content height changed
      if (!e.scrollTopChanged && !e.scrollHeightChanged) return;

      const scrollHeight = e.scrollHeight;
      const scrollTop = e.scrollTop;
      // Use the actual height of the viewport from the event
      const height = e.height;

      // Determine if the view is at the bottom (with a small tolerance)
      const isAtBottom = scrollTop + height >= scrollHeight - 10;

      // Design Doc 3.1.1.A.3: User manual scroll should pause auto-scroll.
      if (!isAtBottom) {
        // If the user scrolls up, we disable auto-scroll and show the "Follow" button.
        setAutoScroll(false);
        setIsScrolledUp(true);
      } else {
        // If user scrolls back to the bottom, re-enable auto-scroll.
        setAutoScroll(true);
        setIsScrolledUp(false);
      }
    });

    // Initial scroll to bottom on mount if logs are present
    if (logs) {
        scrollToBottom();
    }
  };

  // Handler for the "Return to Bottom" / "Follow Logs" button
  const handleResumeAutoScroll = () => {
    // Re-enable auto-scroll and immediately jump to bottom
    setAutoScroll(true);
    scrollToBottom();
  };

  return (
    // Design Doc 5.1.3.B2: Background bg-background
    <div className={cn("relative h-full w-full overflow-hidden rounded-lg border bg-background shadow-inner", className)}>
      <MonacoWrapper
        ref={editorRef}
        value={logs}
        language="log" // Use 'log' or 'plaintext'
        onMount={handleMount}
        options={{
          readOnly: true,
          domReadOnly: true,
          lineNumbers: 'on',
          wordWrap: 'on', // Wrap long log lines
          // Monaco handles virtualization internally (Architecture 9.4.4)
          padding: { top: 12, bottom: 12 },
          // Optimize for logs: disable features not needed
          folding: false,
          codeLens: false,
          contextmenu: false,
          renderLineHighlight: 'none',
          minimap: { enabled: false },
          // Performance optimizations for large files
          largeFileOptimizations: true,
        }}
      />

      {/* "Return to Bottom" Button (Design Doc 3.1.1.A.3) */}
      {/* Using TailwindCSS animation utilities for a smooth appearance */}
      {isScrolledUp && (
        <div className="absolute bottom-4 right-8 z-20 animate-in fade-in slide-in-from-bottom-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleResumeAutoScroll}
            // Use primary color for high visibility
            className="flex items-center gap-2 shadow-xl transition-shadow hover:shadow-2xl bg-primary hover:bg-primary/90"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Follow Logs
          </Button>
        </div>
      )}
    </div>
  );
};

