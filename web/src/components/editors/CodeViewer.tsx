// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React, { useState } from 'react';
// We import the MonacoWrapper which already handles dynamic loading internally.
import MonacoWrapper from './MonacoWrapper';
import { Button } from '~/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '~/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

interface CodeViewerProps {
  code: string;
  language: string;
  fileName?: string;
  className?: string;
  showLineNumbers?: boolean;
}

/**
 * CodeViewer component provides a read-only view for code snippets with syntax highlighting,
 * code folding, and utility actions (Copy/Download). (Design Doc 3.1.1.A.2)
 */
export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  fileName = 'code_snippet.txt',
  className,
  showLineNumbers = true,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Design Doc 3.1.1.A.2: "Copy to clipboard" action
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      // Feedback is subtle via icon change.
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      toast.error('Failed to copy code.');
      console.error('Copy failed: ', err);
    });
  };

  // Design Doc 3.1.1.A.2: "Download" action
  const handleDownload = () => {
    // Determine extension and MIME type comprehensively
    const extensionMap: Record<string, { ext: string, mime: string }> = {
        python: { ext: '.py', mime: 'text/x-python' },
        javascript: { ext: '.js', mime: 'application/javascript' },
        typescript: { ext: '.ts', mime: 'application/typescript' },
        json: { ext: '.json', mime: 'application/json' },
        markdown: { ext: '.md', mime: 'text/markdown' },
        yaml: { ext: '.yaml', mime: 'text/yaml' },
        xml: { ext: '.xml', mime: 'application/xml' },
        html: { ext: '.html', mime: 'text/html' },
        log: { ext: '.log', mime: 'text/plain' },
    };

    const { ext, mime } = extensionMap[language] || { ext: '.txt', mime: 'text/plain' };
    const downloadFileName = fileName.includes('.') ? fileName : `${fileName}${ext}`;
    const mimeType = `${mime};charset=utf-8`;

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${downloadFileName}.`);
  };

  return (
    // Design Doc 5.1.3.B2: Background bg-background (deeper than Card)
    // Add 'group' class to enable hover detection for the toolbar
    <div className={cn("group relative h-full w-full overflow-hidden rounded-lg border bg-background shadow-inner", className)}>
      {/* Toolbar positioned absolutely, visible on group hover for a cleaner interface */}
      <div className="absolute top-2 right-3 z-10 flex gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus-within:opacity-100">

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={handleCopy} aria-label="Copy code" className="h-8 w-8 shadow-md">
              {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? 'Copied!' : 'Copy to clipboard'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={handleDownload} aria-label="Download code" className="h-8 w-8 shadow-md">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download file</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Monaco Editor Instance */}
      <MonacoWrapper
        value={code}
        language={language}
        options={{
          readOnly: true,
          domReadOnly: true, // Optimization for read-only mode
          lineNumbers: showLineNumbers ? 'on' : 'off',
          // Ensure padding so the floating toolbar doesn't obscure the top lines
          padding: { top: 16, bottom: 12 },
          // Optimization for large files
          largeFileOptimizations: true,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

