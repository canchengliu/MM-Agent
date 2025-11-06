// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Check, ChevronDown } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";

import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--color-text-primary)",
  },
  {
    name: "Secondary",
    color: "var(--color-text-secondary)",
  },
  {
    name: "Accent",
    color: "var(--color-text-accent)",
  },
  {
    name: "Success",
    color: "var(--color-text-success)",
  },
  {
    name: "Warning",
    color: "var(--color-text-warning)",
  },
  {
    name: "Danger",
    color: "var(--color-text-danger)",
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "transparent",
  },
  {
    name: "Accent",
    color:
      "color-mix(in srgb, var(--color-background-interactive) 22%, transparent)",
  },
  {
    name: "Secondary",
    color:
      "color-mix(in srgb, var(--color-background-tertiary) 75%, transparent)",
  },
  {
    name: "Success",
    color:
      "color-mix(in srgb, var(--color-background-success) 70%, transparent)",
  },
  {
    name: "Warning",
    color:
      "color-mix(in srgb, var(--color-text-warning) 25%, transparent)",
  },
  {
    name: "Danger",
    color:
      "color-mix(in srgb, var(--color-background-danger) 70%, transparent)",
  },
];

interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;
  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive("textStyle", { color }),
  );

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color }),
  );

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="gap-2 rounded-none text-label"
          variant="ghost"
        >
          <span
            className="rounded-sm px-1"
            style={{
              color: activeColorItem?.color,
              backgroundColor: activeHighlightItem?.color,
            }}
          >
            A
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded-lg border border-border-subtle bg-background-secondary p-1 shadow-lg"
        align="start"
      >
        <div className="flex flex-col">
          <div className="my-1 px-2 text-caption font-semibold text-text-tertiary">
            Color
          </div>
          {TEXT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetColor();
                name !== "Default" &&
                  editor
                    .chain()
                    .focus()
                    .setColor(color || "")
                    .run();
                onOpenChange(false);
              }}
              className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-body-medium transition-colors hover:bg-background-tertiary/60"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border border-border-subtle px-2 py-px font-medium"
                  style={{ color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
            </EditorBubbleItem>
          ))}
        </div>
        <div>
          <div className="my-1 px-2 text-caption font-semibold text-text-tertiary">
            Background
          </div>
          {HIGHLIGHT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetHighlight();
                name !== "Default" &&
                  editor.chain().focus().setHighlight({ color }).run();
                onOpenChange(false);
              }}
              className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-body-medium transition-colors hover:bg-background-tertiary/60"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border border-border-subtle px-2 py-px font-medium"
                  style={{
                    backgroundColor: color,
                    color:
                      name === "Default"
                        ? "var(--color-text-primary)"
                        : "var(--color-text-on-interactive)",
                  }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive("highlight", { color }) && (
                <Check className="h-4 w-4" />
              )}
            </EditorBubbleItem>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
