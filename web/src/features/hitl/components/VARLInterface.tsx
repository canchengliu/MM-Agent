import { Fragment, useEffect } from "react";

import { Markdown } from "~/components/deer-flow/markdown";

import type { InteractionHandler } from "../HITLController";

interface VARLInterfaceProps {
  content: Record<string, unknown> | string | unknown[] | null | undefined;
  onInteractionChange: InteractionHandler;
}

/**
 * Implements the VARL (Vetting and Review Loop) HITL interface.
 * Used for lightweight review-and-approve scenarios.
 */
export function VARLInterface({
  content,
  onInteractionChange,
}: VARLInterfaceProps) {
  useEffect(() => {
    // VARL interactions complete as soon as the reviewer sees the content.
    onInteractionChange({ data: {}, isComplete: true });
  }, [onInteractionChange]);

  const renderContent = () => {
    if (!content) {
      return (
        <p className="text-muted-foreground">No content available for review.</p>
      );
    }

    if (typeof content === "string") {
      return <Markdown>{content}</Markdown>;
    }

    if (Array.isArray(content)) {
      return (
        <ul className="list-disc space-y-1 pl-6">
          {content.map((item, index) => (
            <li key={index}>
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof content === "object") {
      return (
        <dl className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-2">
          {Object.entries(content as Record<string, unknown>).map(
            ([key, value]) => (
              <Fragment key={key}>
                <dt className="font-semibold">{key}:</dt>
                <dd>
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </dd>
              </Fragment>
            ),
          )}
        </dl>
      );
    }

    return (
      <pre className="w-full overflow-auto rounded-md bg-muted/50 p-4 text-xs">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  };

  return <div className="prose prose-sm max-w-none dark:prose-invert">{renderContent()}</div>;
}
