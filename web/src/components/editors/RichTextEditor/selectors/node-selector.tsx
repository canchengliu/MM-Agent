import {
  Check,
  CheckSquare,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  List,
  type LucideIcon,
  TextIcon,
  TextQuote,
} from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import type { Editor } from "@tiptap/core";

import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) => editor.chain().focus().clearNodes().run(),
    isActive: (editor) =>
      editor.isActive("paragraph") &&
      !editor.isActive("bulletList") &&
      !editor.isActive("orderedList") &&
      !editor.isActive("taskList"),
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: CheckSquare,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor.isActive("taskList"),
  },
  {
    name: "Bullet List",
    icon: List,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: TextQuote,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code Block",
    icon: Code,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;

  // Determine the currently active node type
  const activeItem = items.find((item) => item.isActive(editor)) ?? {
    name: "Text", // Default fallback
    icon: TextIcon,
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 rounded-none hover:bg-accent"
        >
          <span className="text-sm whitespace-nowrap">{activeItem.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        {items.map((item) => (
          <EditorBubbleItem
            key={item.name}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border p-1 bg-background">
                <item.icon className="h-4 w-4" />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check className="h-4 w-4 text-primary" />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};

