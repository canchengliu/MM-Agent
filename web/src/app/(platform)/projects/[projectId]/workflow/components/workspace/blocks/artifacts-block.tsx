"use client";

import { useState, useEffect } from "react";
import { Code, Cpu, FileText, Terminal, Wrench } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CodeViewer } from "~/components/editors/CodeViewer";
import { LogViewer } from "~/components/editors/LogViewer";
import type { NodeDetailView } from "~/core/models/node.model";
import type { TranscriptData } from "../useTranscriptData";
import { TranscriptBlock } from "./transcript-block";
import { NodeStatus } from "~/constants/enums";

interface ArtifactsBlockProps {
  node: NodeDetailView;
  dataSource: TranscriptData;
}

// Define the possible tabs based on Design Doc 2.1.2.B
type ArtifactTab = "prompt" | "code" | "logs" | "raw_llm" | "tool_calls";

/**
 * Block 2: Execution Artifacts.
 * Displays Prompt, Generated Code, and Execution Logs using specialized viewers.
 * (Design Doc 5.1.3.B2 Block 2)
 */
export function ArtifactsBlock({ node, dataSource }: ArtifactsBlockProps) {
  const artifacts = dataSource.data?.execution_artifacts;

  // Extract artifacts (Design Doc 2.1.2.B)
  const prompt = artifacts?.prompt;
  const generatedCode = artifacts?.["generated_code.py"];
  const executionLog = artifacts?.["execution.log"];
  const rawLLMResponse = artifacts?.raw_llm_response;
  // Tool call logs are typically complex objects, we serialize them for viewing.
  const toolCallLog = artifacts?.tool_call_log ? JSON.stringify(artifacts.tool_call_log, null, 2) : null;

  const hasArtifacts = !!(prompt || generatedCode || executionLog || rawLLMResponse || toolCallLog);

  // State for active tab
  const [activeTab, setActiveTab] = useState<ArtifactTab>("prompt");

  // Logic for Executing state. Only applies if viewing the latest state (not historical).
  const isExecuting = node.status === NodeStatus.Executing && !dataSource.isHistorical;

  // Determine the active tab based on state and availability
  useEffect(() => {
    if (isExecuting) {
      // Design Doc 5.1.5: If executing, focus on Logs Tab.
      setActiveTab("logs");
    } else {
        // If not executing, check if the current active tab is still valid (has content).
        if (activeTab === "prompt" && prompt) return;
        if (activeTab === "code" && generatedCode) return;
        if (activeTab === "logs" && executionLog) return;
        if (activeTab === "tool_calls" && toolCallLog) return;
        if (activeTab === "raw_llm" && rawLLMResponse) return;

        // If the current tab is invalid, fall back to the first available tab.
        if (prompt) setActiveTab("prompt");
        else if (generatedCode) setActiveTab("code");
        else if (executionLog) setActiveTab("logs");
        else if (toolCallLog) setActiveTab("tool_calls");
        else if (rawLLMResponse) setActiveTab("raw_llm");
    }
  }, [isExecuting, prompt, generatedCode, executionLog, rawLLMResponse, toolCallLog, activeTab]);

  // Design Doc 5.1.5: If executing, force the block open.
  const forceOpen = isExecuting;

  // Define a standard height for the viewers (Design Doc 5.1.3.B2)
  const VIEWER_HEIGHT = "h-[500px]";

  return (
    // Design Doc 2.4.B: Artifacts default collapsed (managed by UIInteractionSlice defaults)
    <TranscriptBlock
        blockKey="artifacts"
        title="Execution Artifacts"
        forceOpen={forceOpen}
    >
      {hasArtifacts ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ArtifactTab)}>
          <TabsList>
            {prompt && <TabsTrigger value="prompt"><FileText className="h-4 w-4 mr-1.5" /> Prompt</TabsTrigger>}
            {generatedCode && <TabsTrigger value="code"><Code className="h-4 w-4 mr-1.5" /> Code</TabsTrigger>}
            {(executionLog || isExecuting) && (
                <TabsTrigger value="logs">
                    <Terminal className="h-4 w-4 mr-1.5" />
                    Logs
                    {/* Live indicator when executing */}
                    {isExecuting && <span className="ml-2 h-2 w-2 rounded-full bg-cyan-500 animate-pulse" title="Live"></span>}
                </TabsTrigger>
            )}
            {toolCallLog && <TabsTrigger value="tool_calls"><Wrench className="h-4 w-4 mr-1.5" /> Tools</TabsTrigger>}
            {rawLLMResponse && <TabsTrigger value="raw_llm"><Cpu className="h-4 w-4 mr-1.5" /> Raw LLM</TabsTrigger>}
          </TabsList>

          <div className="mt-4">
            {/* TabsContent always mounts content (just hides it), so Monaco will initialize correctly */}
            <TabsContent value="prompt" className={VIEWER_HEIGHT}>
                {prompt && <CodeViewer code={prompt} language="markdown" fileName="prompt.md" />}
            </TabsContent>
            <TabsContent value="code" className={VIEWER_HEIGHT}>
                {generatedCode && <CodeViewer code={generatedCode} language="python" fileName="generated_code.py" />}
            </TabsContent>
            <TabsContent value="logs" className={VIEWER_HEIGHT}>
                {/* LogViewer handles real-time updates internally by reacting to 'logs' prop changes */}
                {/* We display the viewer if logs exist or if currently executing. */}
                {(executionLog || isExecuting) && <LogViewer logs={executionLog || ""} />}
            </TabsContent>
            <TabsContent value="tool_calls" className={VIEWER_HEIGHT}>
                {toolCallLog && <CodeViewer code={toolCallLog} language="json" fileName="tool_calls.json" />}
            </TabsContent>
            <TabsContent value="raw_llm" className={VIEWER_HEIGHT}>
                {rawLLMResponse && <CodeViewer code={rawLLMResponse} language="text" fileName="raw_llm_response.txt" />}
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50">
          No execution artifacts available for this run.
        </div>
      )}
    </TranscriptBlock>
  );
}

