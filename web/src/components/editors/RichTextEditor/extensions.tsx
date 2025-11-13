// Configuration file for all Tiptap extensions used in the editor.
import {
  // Core Tiptap/Novel extensions
  StarterKit,
  Placeholder,
  TiptapLink,
  TiptapUnderline,
  TaskList,
  TaskItem,
  HorizontalRule,
  CodeBlockLowlight,
  // Feature extensions
  Color,
  TextStyle,
  HighlightExtension,
  GlobalDragHandle,
  CustomKeymap,
  // Image handling
  UpdatedImage,
  UploadImagesPlugin,
  // AI features
  AIHighlight,
} from "novel";

// Markdown support
import { Markdown } from "tiptap-markdown";

// Table support
import { Table } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";

// Lowlight for syntax highlighting
import { common, createLowlight } from "lowlight";

import { cx } from "class-variance-authority";

// Custom Mathematics extension with serialization
import { MathematicsWithMarkdown } from "./math-serializer";
import { katexOptions } from "~/core/markdown/katex";

// --- Extension Configurations ---

const aiHighlight = AIHighlight;
const placeholder = Placeholder; // Configured via editor props dynamically

// Links
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors cursor-pointer",
    ),
  },
  openOnClick: false,
});

// Images (Using UpdatedImage from Novel)
const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-border shadow-sm"),
  },
  allowBase64: true,
}).extend({
    // Integrate the image upload plugin
    addProseMirrorPlugins() {
        return [
            UploadImagesPlugin({
                // Style applied while uploading (uses .img-placeholder in CSS)
                imageClass: cx("opacity-50 rounded-lg border border-border"),
            }),
        ];
    },
});


// Task Lists
const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-0"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start my-1"), // High density spacing
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({});

// StarterKit (Base document structure)
const starterKit = StarterKit.configure({
  // Configuration relies on 'prose' styles customized in tailwind.config.js (Design Doc 4.1.2.D)
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary pl-4 italic text-muted-foreground"),
    },
  },
  codeBlock: false, // Use CodeBlockLowlight instead
  code: {
    HTMLAttributes: {
      spellcheck: "false",
      // Ensure Geist Mono is used
      class: cx("font-mono"),
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "hsl(var(--primary))",
    width: 2,
  },
});

// Code Block with Syntax Highlighting
const codeBlockLowlight = CodeBlockLowlight.configure({
  lowlight: createLowlight(common),
  HTMLAttributes: {
    class: cx("font-mono text-sm"),
  },
});

// Mathematics (LaTeX)
const mathematics = MathematicsWithMarkdown.configure({
  HTMLAttributes: {
    class: cx("text-foreground rounded-sm p-0.5 transition-colors hover:bg-accent cursor-pointer inline-block"),
  },
  katexOptions: {
      ...katexOptions,
      throwOnError: false // Don't crash the editor while typing formulas
  },
});

// Tables
const table = Table.configure({ resizable: true });
const tableRow = TableRow.configure();
const tableCell = TableCell.configure({
    HTMLAttributes: {
        class: cx("border border-border p-2 text-left align-top"),
    }
});
const tableHeader = TableHeader.configure({
    HTMLAttributes: {
        class: cx("border border-border p-2 text-left font-bold bg-muted align-top"),
    }
});

// Markdown Serialization/Deserialization
const markdownExtension = Markdown.configure({
  html: true, // Allow HTML content if necessary
  tightLists: true, // High density lists
  linkify: false,
  breaks: false,
});

const globalDragHandle = GlobalDragHandle.configure({});
const highlight = HighlightExtension.configure({ multicolor: true });


// Export the list of all extensions
export const defaultExtensions = [
  // Base
  starterKit,
  placeholder,
  CustomKeymap,
  markdownExtension,
  // Formatting
  TiptapUnderline,
  TextStyle,
  Color,
  highlight,
  // Nodes
  tiptapLink,
  updatedImage,
  taskList,
  taskItem,
  table,
  tableRow,
  tableCell,
  tableHeader,
  horizontalRule,
  codeBlockLowlight,
  mathematics,
  // Utilities
  aiHighlight, // Required for AI features
  globalDragHandle,
];

