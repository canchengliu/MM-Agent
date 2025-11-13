import { type VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "~/components/ui/badge";
import type { ProjectStatus } from "~/constants/enums";
import { cn } from "~/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/**
 * Semantic badge for displaying the current project status.
 */
export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  let variant: BadgeVariant | undefined = "secondary";
  let text = "";
  let customClasses = "";

  switch (status) {
    case "Configuring":
      variant = "warning";
      text = "Configuring";
      break;
    case "Running":
      variant = undefined;
      text = "Running";
      customClasses =
        "border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300";
      break;
    case "Completed":
      variant = "success";
      text = "Completed";
      break;
    default:
      variant = "outline";
      text = "Unknown";
  }

  return (
    <Badge variant={variant} className={cn(customClasses, className)}>
      {text}
    </Badge>
  );
}
