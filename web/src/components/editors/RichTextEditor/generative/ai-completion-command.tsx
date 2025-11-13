import { CommandGroup, CommandItem, CommandSeparator } from "~/components/ui/command";
import { useEditor } from "novel";
import { Check, TextQuote, TrashIcon } from "lucide-react";

interface AICompletionCommandsProps {
  completion: string;
  onDiscard: () => void;
}

/**
 * Commands displayed after AI completion is generated (Replace, Insert, Discard).
 */
const AICompletionCommands = ({
  completion,
  onDiscard,
}: AICompletionCommandsProps) => {
  const { editor } = useEditor();
  if (!editor) return null;

  const handleReplace = () => {
    const selection = editor.view.state.selection;
    // Replace the current selection with the AI completion
    editor
      .chain()
      .focus()
      .insertContentAt(
        {
          from: selection.from,
          to: selection.to,
        },
        completion,
      )
      .run();
  };

  const handleInsertBelow = () => {
    const selection = editor.view.state.selection;
    // Insert the AI completion immediately after the current selection
    editor
      .chain()
      .focus()
      .insertContentAt(selection.to, completion)
      .run();
  };

  return (
    <>
      <CommandGroup>
        <CommandItem
          className="gap-2 px-4 cursor-pointer"
          value="replace"
          onSelect={handleReplace}
        >
          <Check className="text-muted-foreground h-4 w-4" />
          Replace selection
        </CommandItem>
        <CommandItem
          className="gap-2 px-4 cursor-pointer"
          value="insert"
          onSelect={handleInsertBelow}
        >
          <TextQuote className="text-muted-foreground h-4 w-4" />
          Insert below
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />

      <CommandGroup>
        <CommandItem onSelect={onDiscard} value="thrash" className="gap-2 px-4 cursor-pointer">
          <TrashIcon className="text-muted-foreground h-4 w-4" />
          Discard
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AICompletionCommands;

