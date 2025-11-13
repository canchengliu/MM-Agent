/**
 * Configuration for the Slash Command (/) functionality.
 */

import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
  SigmaIcon,
  TableIcon,
  ImageIcon,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";
import { uploadFn } from "./image-upload";

export const suggestionItems = createSuggestionItems([
  // Basic Text
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  // Headings
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["h1", "title"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["h2", "subtitle"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["h3"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  // Lists
  {
    title: "To-do List",
    description: "Track tasks with a checklist.",
    searchTerms: ["todo", "task", "check"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "bullet"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered", "number"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  // Specialized Blocks
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock", "snippet"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Math Block (LaTeX)",
    description: "Insert a display math formula.",
    searchTerms: ["math", "latex", "formula", "equation"],
    icon: <SigmaIcon size={18} />,
    command: ({ editor, range }) =>
      // Insert a block math node with placeholder content
      editor.chain().focus().deleteRange(range).setLatex({ latex: "E = mc^2", display: true }).run(),
  },
  {
    title: "Table",
    description: "Insert a table.",
    searchTerms: ["table", "grid"],
    icon: <TableIcon size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  // Media
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media", "image"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        // Trigger file input click
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                if (!file) return;
                const pos = editor.view.state.selection.from;
                // Use the defined upload function
                uploadFn(file, editor.view, pos);
            }
        };
        input.click();
    },
   },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});

