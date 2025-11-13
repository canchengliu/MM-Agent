import { Check, ChevronDown } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";

import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";

export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

// Define color palettes (using standard colors for Tiptap compatibility)
const TEXT_COLORS: BubbleColorMenuItem[] = [
  { name: "Default", color: "inherit" },
  { name: "Gray", color: "#6b7280" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Yellow", color: "#eab308" },
  { name: "Green", color: "#22c55e" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Purple", color: "#a855f7" },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  { name: "Default", color: "transparent" },
  // Using lighter shades for highlights (Tailwind -100/200 shades)
  { name: "Gray", color: "#f3f4f6" },
  { name: "Red", color: "#fee2e2" },
  { name: "Orange", color: "#ffedd5" },
  { name: "Yellow", color: "#fef08a" },
  { name: "Green", color: "#dcfce7" },
  { name: "Blue", color: "#dbeafe" },
  { name: "Purple", color: "#f3e8ff" },
];

interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;

  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive("textStyle", { color })
  ) || TEXT_COLORS[0];

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color })
  ) || HIGHLIGHT_COLORS[0];

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" className="gap-2 rounded-none hover:bg-accent" variant="ghost">
          <span
            className="rounded-sm px-1 text-sm font-medium"
            style={{
              color: activeColorItem.color === 'inherit' ? undefined : activeColorItem.color,
              backgroundColor: activeHighlightItem.color === 'transparent' ? undefined : activeHighlightItem.color,
            }}
          >
            A
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className="w-48 p-1 max-h-80 overflow-y-auto"
        align="start"
      >
        <div className="flex flex-col">
          <div className="text-muted-foreground px-2 py-1 text-xs font-semibold uppercase">
            Text Color
          </div>
          {TEXT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                if (name === "Default") {
                    editor.chain().focus().unsetColor().run();
                } else {
                    editor.chain().focus().setColor(color).run();
                }
              }}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent rounded-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ color: color === 'inherit' ? undefined : color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {activeColorItem.name === name && <Check className="h-4 w-4 text-primary" />}
            </EditorBubbleItem>
          ))}
        </div>

        <Separator className="my-1" />

        <div>
          <div className="text-muted-foreground px-2 py-1 text-xs font-semibold uppercase">
            Background Color
          </div>
          {HIGHLIGHT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                if (name === "Default") {
                    editor.chain().focus().unsetHighlight().run();
                } else {
                    editor.chain().focus().setHighlight({ color }).run();
                }
              }}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent rounded-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ backgroundColor: color === 'transparent' ? undefined : color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
                {activeHighlightItem.name === name && <Check className="h-4 w-4 text-primary" />}
            </EditorBubbleItem>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

