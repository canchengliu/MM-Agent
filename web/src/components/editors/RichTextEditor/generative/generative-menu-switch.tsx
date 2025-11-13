import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Fragment, type ReactNode, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { AISelector } from "./ai-selector";
import { Sparkles } from "lucide-react";

interface GenerativeMenuSwitchProps {
  children: ReactNode; // Standard bubble menu items
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Controls the switching between the standard bubble menu and the AI interaction menu.
 */
const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange,
}: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  // Clean up AI highlights when the AI panel is closed
  useEffect(() => {
    if (!open && editor) {
        removeAIHighlight(editor);
    }
  }, [open, editor]);

  if (!editor) return null;

  return (
    <EditorBubble
      tippyOptions={{
        // Adjust placement depending on whether the AI panel is open
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          // Ensure highlight is unset when bubble hides completely
          editor.chain().unsetHighlight().run();
        },
      }}
      className="border-border bg-background flex w-fit max-w-[90vw] overflow-hidden rounded-md border shadow-xl"
    >
      {open ? (
        <AISelector open={open} onOpenChange={onOpenChange} />
      ) : (
        <Fragment>
          {/* Button to activate AI mode */}
          <Button
            className="gap-1 rounded-none text-purple-500 hover:text-purple-600 hover:bg-accent"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Sparkles className="h-4 w-4 fill-current" />
            Ask AI
          </Button>
          {/* Standard bubble menu items */}
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;

