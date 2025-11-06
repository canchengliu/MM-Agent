// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  AIHighlight,
  CharacterCount,
  CodeBlockLowlight,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  HighlightExtension,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  Twitter,
  UpdatedImage,
  UploadImagesPlugin,
  Youtube,
} from "novel";
import { Markdown } from "tiptap-markdown";
import { Table } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";
import { MathematicsWithMarkdown } from "./math-serializer";

//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects
const aiHighlight = AIHighlight;
//You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-text-accent underline underline-offset-[3px] transition-colors hover:text-text-primary",
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx(
          "opacity-40 rounded-lg border border-border-subtle bg-background-secondary object-contain",
        ),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx(
      "rounded-lg border border-border-subtle bg-background-secondary transition-[filter] hover:brightness-95",
    ),
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx(
      "rounded-lg border border-border-subtle bg-background-secondary transition-[filter] hover:brightness-95",
    ),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose space-y-3 pl-0"),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start gap-2 text-body-medium text-text-primary"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("my-10 h-px border-0 bg-border-subtle"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx(
        "list-disc pl-6 text-body-medium text-text-primary marker:text-text-secondary",
      ),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx(
        "list-decimal pl-6 text-body-medium text-text-primary marker:text-text-secondary",
      ),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("text-body-medium text-text-primary"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx(
        "relative border-l-2 border-border-interactive bg-background-secondary/60 pl-6 italic text-text-secondary",
      ),
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      class: cx(
        "rounded bg-background-tertiary/60 px-1 py-0.5 font-mono text-text-accent",
      ),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "var(--color-border-focused)",
    width: 4,
  },
  gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  // configure lowlight: common /  all / use highlightJS in case there is a need to specify certain language grammars only
  // common: covers 37 language grammars which should be good enough in most cases
  lowlight: createLowlight(common),
  HTMLAttributes: {
    class: cx(
      "relative rounded-lg border border-border-subtle bg-background-secondary text-text-primary shadow-sm font-mono",
    ),
  },
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cx(
      "rounded-lg border border-border-subtle bg-background-secondary",
    ),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cx("not-prose rounded-lg border border-border-subtle"),
  },
  inline: false,
});

const mathematics = MathematicsWithMarkdown.configure({
  HTMLAttributes: {
    class: cx(
      "cursor-pointer rounded px-1 text-text-accent transition-colors hover:bg-background-tertiary/60",
    ),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

const table = Table.configure();
const tableRow = TableRow.configure();
const tableCell = TableCell.configure();
const tableHeader = TableHeader.configure();

const markdownExtension = Markdown.configure({
  html: true,
  tightLists: true,
  tightListClass: "tight",
  bulletListMarker: "-",
  linkify: false,
  breaks: false,
  transformPastedText: false,
  transformCopiedText: false,
});

const globalDragHandle = GlobalDragHandle.configure({});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  updatedImage,
  taskList,
  taskItem,
  table,
  tableRow,
  tableCell,
  tableHeader,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  markdownExtension,
  HighlightExtension,
  TextStyle,
  Color,
  CustomKeymap,
  globalDragHandle,
];
