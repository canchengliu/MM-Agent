// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { EditorProps, OnMount, Monaco } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import type { editor } from 'monaco-editor';

// Define the Loading fallback component
const MonacoLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

// Dynamically import Monaco Editor for optimized loading (Architecture 9.4.1)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: MonacoLoading,
});

// Define base options for Monaco, ensuring consistency across the platform
// Design Doc 4.1.2.B: Use Geist Mono. Design Doc 4.3.B.3: text-sm (14px).
const MONACO_BASE_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  // Use the CSS variable set by Next.js font optimization (Geist Mono)
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 14,
  lineHeight: 20, // Improved readability
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true, // Automatically adjust layout when the container size changes
  // Configure subtle scrollbars
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    useShadows: false,
  },
  smoothScrolling: true,
  folding: true, // Enable code folding by default (Design Doc 3.1.1.A.2)
};

// Helper function to define custom themes that match the application's aesthetic
const defineCustomThemes = (monaco: Monaco) => {
  // Design Doc 4.1.1.B defines the colors. Monaco requires hex values.

  // Dark theme (Design Doc 4.1.1: Dark Mode First)
  // --background: 222.2 84% 4.9% ≈ #020617 (Deep Blue-Black / Slate 950)
  const darkBg = '#020617';
  // --secondary/border: 217.2 32.6% 17.5% ≈ #1e293b. Used for subtle highlights with sufficient contrast.
  const darkHighlight = '#1e293b';

  monaco.editor.defineTheme('o-award-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      // Design Doc 5.1.3.B2 specifies bg-background for the viewer.
      'editor.background': darkBg,
      'editorGutter.background': darkBg, // Ensure gutter matches background
      'editor.lineHighlightBackground': darkHighlight,
      'editor.selectionBackground': '#334155', // Slate 700 approximation
    },
  });

  // Light theme
  // --background: 0 0% 100% ≈ #ffffff
  const lightBg = '#ffffff';
  monaco.editor.defineTheme('o-award-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': lightBg,
      'editorGutter.background': lightBg,
      'editor.lineHighlightBackground': '#f1f5f9', // Slate 100 approximation
    },
  });
};


export interface MonacoWrapperProps extends EditorProps {
  // We primarily extend EditorProps
}

/**
 * MonacoWrapper component integrates Monaco Editor with the application's theming and font settings.
 * It handles dynamic loading, custom theme definition, and configuration synchronization.
 */
const MonacoWrapper = React.forwardRef<editor.IStandaloneCodeEditor, MonacoWrapperProps>(
  ({ options, onMount, beforeMount, ...props }, ref) => {
    const { resolvedTheme } = useTheme();

    // Determine Monaco theme based on next-themes (Design Doc 4.1.1)
    // Default to dark if theme is unresolved (e.g., during initialization, matching defaultTheme="dark")
    const monacoTheme = (resolvedTheme === 'dark' || !resolvedTheme) ? 'o-award-dark' : 'o-award-light';

    // Merge base options with instance-specific options
    const combinedOptions = React.useMemo(() => ({
      ...MONACO_BASE_OPTIONS,
      ...options,
    }), [options]);

    // Handle Monaco initialization (before mount)
    const handleBeforeMount = (monaco: Monaco) => {
        // Define custom themes before the editor mounts
        defineCustomThemes(monaco);
        if (beforeMount) {
            beforeMount(monaco);
        }
    };

    // Handle editor mount lifecycle
    const handleOnMount: OnMount = (editorInstance, monaco) => {
      // Assign the editor instance to the forwarded ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(editorInstance);
        } else {
          ref.current = editorInstance;
        }
      }
      // Call original onMount if provided
      if (onMount) {
        onMount(editorInstance, monaco);
      }
    };

    return (
      <MonacoEditor
        // Keying by theme helps ensure Monaco re-initializes correctly if theme changes rapidly
        key={monacoTheme}
        theme={monacoTheme}
        options={combinedOptions}
        onMount={handleOnMount}
        beforeMount={handleBeforeMount}
        loading={<MonacoLoading />}
        {...props}
      />
    );
  }
);

MonacoWrapper.displayName = 'MonacoWrapper';

export default MonacoWrapper;

