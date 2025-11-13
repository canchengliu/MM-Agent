import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { SigmaIcon } from "lucide-react";
import { useEditor } from "novel";

/**
 * MathSelector button for the bubble menu.
 * Allows users to convert selected text into an inline LaTeX formula.
 */
export const MathSelector = () => {
  const { editor } = useEditor();

  if (!editor) return null;

  const isActive = editor.isActive("math");

  const handleMathToggle = () => {
    // If the selection is already math, we might want to edit it or unwrap it.
    // Novel's setLatex handles editing if the cursor is inside. 
    // If we want to unwrap, we'd use unsetLatex. 
    // For simplicity here, we primarily focus on wrapping selection.
    
    const { from, to } = editor.state.selection;
    
    // If the selection is empty and we are not inside a math node, do nothing.
    if (from === to && !isActive) return;

    if (isActive) {
        // If active, Novel's default behavior allows editing the LaTeX source.
        // We can also explicitly trigger focus if needed, but usually it works out of the box.
        editor.chain().focus().run();
    } else {
      // Convert selected text to inline LaTeX
      const latex = editor.state.doc.textBetween(from, to);

      if (!latex.trim()) return;

      // Insert/replace selection with math node (defaulting to inline: display: false)
      editor.chain().focus().setLatex({ latex, display: false }).run();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-none hover:bg-accent"
      onClick={handleMathToggle}
      type="button"
      title="Convert to Math Formula (Inline)"
    >
      <SigmaIcon
        className={cn("h-4 w-4", { "text-primary": isActive })}
        strokeWidth={2}
      />
    </Button>
  );
};

