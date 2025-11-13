"use client";

/**
 * Rich Text Editor Component based on Novel (Tiptap/ProseMirror).
 * Implements Design Doc requirement 4.3.B.4 (Rich Text/Markdown Editor).
 */

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  Placeholder,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import type { Content } from "@tiptap/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

// Core configuration and utilities
import { defaultExtensions } from "./extensions";
import { slashCommand, suggestionItems } from "./slash-command";
import { uploadFn } from "./image-upload";
import { normalizeMathForEditor, unescapeLatexInMath } from "~/core/utils/markdown";

// UI Components (Selectors and Menus)
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { Separator } from "~/components/ui/separator";

import { cn } from "~/lib/utils";

export interface RichTextEditorProps {
  initialContent: Content; // Markdown string or Tiptap JSON
  onUpdate?: (markdown: string) => void;
  debounceDuration?: number;
  className?: string;
  placeholder?: string;
  editable?: boolean;
}

export const RichTextEditor = ({
    initialContent,
    onUpdate,
    debounceDuration = 750,
    className = "",
    placeholder = "Start writing here, or type '/' for commands...",
    editable = true,
}: RichTextEditorProps) => {

  // Normalize initial content for editor consumption (especially LaTeX delimiters)
  const content = useMemo(() => {
    if (typeof initialContent === "string") {
      return normalizeMathForEditor(initialContent);
    }
    return initialContent;
  }, [initialContent]);

  // (Task 22): Track if the initial update has been dispatched via onCreate.
  // Reset when initialContent changes to allow re-initialization.
  const initialUpdateDispatched = useRef(false);
  useEffect(() => {
    initialUpdateDispatched.current = false;
  }, [initialContent]);

  // Combine default extensions with the slash command extension
  const extensions = useMemo(() => {
    // Create placeholder extension with the provided placeholder text
    const placeholderExtension = Placeholder.configure({
      placeholder,
    });
    // Replace the default placeholder with the configured one
    const extensionsWithoutPlaceholder = defaultExtensions.filter(ext => ext.name !== 'placeholder');
    return [...extensionsWithoutPlaceholder, placeholderExtension, slashCommand];
  }, [placeholder]);

  // State for managing the visibility of bubble menu selectors
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // (Task 22): Helper function to serialize editor content to Markdown
  const serializeToMarkdown = (editor: EditorInstance): string => {
    let markdown = editor.storage.markdown.getMarkdown();
    // Crucial step: Unescape LaTeX characters that Tiptap might have escaped
    markdown = unescapeLatexInMath(markdown);
    return markdown;
  };

  // Debounced update handler for serializing content back to Markdown
  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      if (onUpdate) {
        const markdown = serializeToMarkdown(editor);
        onUpdate(markdown);
      }
    },
    debounceDuration,
  );

  return (
    <div className={cn("relative w-full h-full", className)}>
      <EditorRoot>
        <EditorContent
          editable={editable}
          immediatelyRender={false}
          initialContent={content as JSONContent}
          extensions={extensions}
          className="h-full w-full overflow-y-auto"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              // Apply Tailwind Typography styles ('prose'). Customized for high density (Design Doc 4.1.2.D).
              // Styles applied here are further customized by prosemirror.css
              class:
                "prose dark:prose-invert focus:outline-none max-w-full h-full",
            },
          }}
          onUpdate={({ editor }) => {
            if (!editable) return;
            debouncedUpdates(editor);
          }}
          // (Task 22): Ensure the parent component receives the content immediately upon initialization.
          // This is crucial for the Manual Edit feature so that the 'Save' button logic (e.g. hasChanges) works correctly from the start.
          onCreate={({ editor }) => {
            if (!editable || !onUpdate || initialUpdateDispatched.current) return;

            // Tiptap's onCreate fires after the initial content is loaded.
            // We immediately update the parent (e.g. OutputBlock/Store) with the serialized content.
            const markdown = serializeToMarkdown(editor);
            // We call onUpdate directly, bypassing the debounce for the initial load.
            onUpdate(markdown);
            initialUpdateDispatched.current = true;
          }}
          slotAfter={<ImageResizer />}
        >
          {/* 1. Slash Command Menu (/) */}
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover px-1 py-2 shadow-lg transition-all">
            <EditorCommandEmpty className="text-muted-foreground px-2 text-sm">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent aria-selected:bg-accent cursor-pointer"
                  key={item.title}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* 2. Bubble Menu (Floating Toolbar on selection) */}
          {editable && (
            <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
                <Separator orientation="vertical" className="h-5" />
                <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                <Separator orientation="vertical" className="h-5" />
                <TextButtons />
                <Separator orientation="vertical" className="h-5" />
                <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                <Separator orientation="vertical" className="h-5" />
                <MathSelector />
                <Separator orientation="vertical" className="h-5" />
                <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          )}

        </EditorContent>
      </EditorRoot>
    </div>
  );
};

