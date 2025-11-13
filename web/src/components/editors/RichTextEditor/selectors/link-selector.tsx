import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { Check, Trash, LinkIcon } from "lucide-react";
import { useEditor } from "novel";
import { useEffect, useRef, useState } from "react";

// Helper functions for URL validation and normalization
export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    // Attempt to fix common missing protocol
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (_e) {
    return null;
  }
  return null;
}

interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (open && editor) {
        // Initialize input value with the current link href if active
        setInputValue(editor.getAttributes("link").href || "");
        // Autofocus the input when the popover opens
        setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, editor]);


  if (!editor) return null;

  const handleSetLink = (e: React.FormEvent) => {
    e.preventDefault();
    const url = getUrlFromString(inputValue);
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      onOpenChange(false);
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    onOpenChange(false);
  };

  const isActive = editor.isActive("link");

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-none hover:bg-accent"
          title="Set Link"
        >
          <LinkIcon
             className={cn("h-4 w-4", {
                "text-primary": isActive,
             })}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-1" sideOffset={5}>
        <form onSubmit={handleSetLink} className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Paste or type a link..."
            className="flex-1 h-8 text-sm border-none focus-visible:ring-0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {isActive ? (
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleRemoveLink}
              title="Remove Link"
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
                size="icon" 
                type="submit" 
                className="h-8 w-8" 
                disabled={!getUrlFromString(inputValue)}
                title="Apply Link"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};

