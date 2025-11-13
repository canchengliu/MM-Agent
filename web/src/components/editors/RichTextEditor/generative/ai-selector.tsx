"use client";

import { Command, CommandInput } from "~/components/ui/command";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { useProseCompletion } from "~/hooks/use-prose-completion";
import { MarkdownRenderer } from "~/components/renderers/MarkdownRenderer";

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The main AI interaction panel within the editor's bubble menu.
 */
export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  // Use the custom hook for AI completion streaming
  const { completion, complete, isLoading, reset } = useProseCompletion();

  if (!editor) return null;

  const hasCompletion = completion.length > 0;

  const handleCommandSubmit = () => {
    if (isLoading || !inputValue.trim()) return;

    // Determine the context for the AI prompt
    let promptContext: string;

    if (hasCompletion) {
        // If there is already a completion, use it as context
        promptContext = completion;
    } else {
        // Otherwise, use the current selection as context
        const slice = editor.state.selection.content();
        promptContext = editor.storage.markdown.serializer.serialize(
            slice.content,
        );
    }

    complete(promptContext, {
        body: { option: "zap", command: inputValue },
    });
    setInputValue("");
  };

  const handleDiscard = () => {
    editor.chain().unsetHighlight().focus().run();
    reset();
  };

  return (
    <Command className="w-[350px] shadow-lg bg-popover">
      {/* Display the generated completion */}
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="p-4">
              <MarkdownRenderer content={completion} className="prose-sm" />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading && !hasCompletion && (
        <div className="flex h-12 w-full items-center justify-center px-4 text-sm font-medium text-purple-500">
          <Sparkles className="mr-2 h-4 w-4 shrink-0 animate-pulse fill-current" />
          AI is thinking...
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        </div>
      )}

      {/* Input and Commands */}
      {(!isLoading || hasCompletion) && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next..."
                  : "Ask AI to edit or generate..."
              }
              // Highlight the relevant area in the editor when focusing the AI input
              onFocus={() => addAIHighlight(editor)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommandSubmit();
                }
              }}
            />
            <Button
              size="icon"
              className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
              onClick={handleCommandSubmit}
              disabled={isLoading || !inputValue.trim()}
            >
              <ArrowUp className="h-4 w-4 text-white" />
            </Button>
          </div>
          
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={handleDiscard}
              completion={completion}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) =>
                complete(value, { body: { option } })
              }
            />
          )}
        </>
      )}
    </Command>
  );
}

