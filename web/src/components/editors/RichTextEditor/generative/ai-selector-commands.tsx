import {
  ArrowDownWideNarrow,
  RefreshCcwDot,
  StepForward,
  WrapText,
} from "lucide-react";
import { getPrevText, useEditor } from "novel";
import { CommandGroup, CommandItem, CommandSeparator } from "~/components/ui/command";

// Predefined AI operations
const options = [
  {
    value: "improve",
    label: "Improve writing",
    icon: RefreshCcwDot,
  },
  {
    value: "shorter",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "longer",
    label: "Make longer",
    icon: WrapText,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

/**
 * Displays predefined AI commands (e.g., Improve, Shorten, Continue).
 */
const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();
  if (!editor) return null;

  const handleSelectionCommand = (value: string) => {
    // Get the currently selected content and serialize it to Markdown
    const slice = editor.state.selection.content();
    const text = editor.storage.markdown.serializer.serialize(
      slice.content,
    );
    onSelect(text, value);
  };

  const handleContinueCommand = () => {
    const pos = editor.state.selection.from;
    // Get text preceding the cursor as context (Novel utility)
    const text = getPrevText(editor, pos);
    onSelect(text, "continue");
  };

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={handleSelectionCommand}
            className="flex gap-2 px-4 cursor-pointer"
            key={option.value}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to generate">
        <CommandItem
          onSelect={handleContinueCommand}
          value="continue"
          className="gap-2 px-4 cursor-pointer"
        >
          <StepForward className="h-4 w-4 text-purple-500" />
          Continue writing
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;

