"use client";

import { AlertTriangle, CheckCircle, Loader2, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ProjectDetailRead } from "~/core/models/project.model";
import { useStore } from "~/core/store";
import { cn } from "~/lib/utils";

interface WorkflowStartControlProps {
  project: ProjectDetailRead;
}

interface PreconditionCheck {
  id: string;
  label: string;
  met: boolean;
  description: string;
}

/**
 * Controls for starting the workflow, including precondition checks (Task 7, API 3.3.1).
 */
export function WorkflowStartControl({ project }: WorkflowStartControlProps) {
  const router = useRouter();
  const { startWorkflow, isStartingWorkflow } = useStore(
    useShallow((state) => ({
      startWorkflow: state.startWorkflow,
      isStartingWorkflow: state.isStartingWorkflow,
    })),
  );

  const preconditions = useMemo((): PreconditionCheck[] => {
    const hasProblemDescription = project.files.some(
      (file) => file.role === "Problem Description",
    );
    const problemTypeSet = project.problem_type !== "-";
    const inConfiguringState = project.status === "Configuring";

    return [
      {
        id: "state",
        label: "Project Status: Configuring",
        met: inConfiguringState,
        description: `The project must be in the "Configuring" state to start the workflow. Current state: "${project.status}".`,
      },
      {
        id: "type",
        label: "Problem Type Selected (A-F)",
        met: problemTypeSet,
        description:
          'The Problem Type must be set (A-F). It cannot remain "Unassigned" (-). (FRS P2.4)',
      },
      {
        id: "file",
        label: "Problem Description Uploaded",
        met: hasProblemDescription,
        description:
          "The official contest statement (Role: Problem Description) must be uploaded. (API 3.3.1 Prerequisite)",
      },
    ];
  }, [project]);

  const allPreconditionsMet = preconditions.every((p) => p.met);
  const canStart = allPreconditionsMet && !isStartingWorkflow;

  const handleStart = async () => {
    if (!canStart) return;

    const firstNode = await startWorkflow(project.id);
    if (firstNode) {
      router.push(`/projects/${project.id}/workflow`);
    }
  };

  if (project.workflow_instance_id || project.status !== "Configuring") {
    return (
      <Card className="border-blue-500/40 bg-blue-50/30 shadow-md dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle>Workflow Status</CardTitle>
          <CardDescription>
            The workflow for this project has already been initiated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>
              {project.status === "Running"
                ? "Workflow Active"
                : "Workflow Completed"}
            </AlertTitle>
            <AlertDescription>
              Project configuration is now locked. Proceed to the Workflow
              Cockpit to monitor progress or view results.
            </AlertDescription>
          </Alert>
          <Button className="mt-4 w-full" size="lg" asChild>
            <Link href={`/projects/${project.id}/workflow`}>
              <Rocket className="mr-2 h-4 w-4" />
              Go to Workflow Cockpit
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 shadow-lg">
      <CardHeader>
        <CardTitle>Start Workflow Execution</CardTitle>
        <CardDescription>
          Validate readiness and initiate the automated modeling process (W1.1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Pre-flight Checklist</h4>
          <ul className="space-y-2">
            {preconditions.map((check) => (
              <TooltipProvider key={check.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <li
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-3 text-sm transition-colors",
                        check.met
                          ? "border-green-500/50 bg-green-50/50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "border-amber-500/50 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                      )}
                    >
                      {check.met ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      <span>{check.label}</span>
                    </li>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    {check.description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </ul>
        </div>

        {!allPreconditionsMet && (
          <Alert variant="warning">
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Please complete all checklist items before starting the workflow.
            </AlertDescription>
          </Alert>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!canStart}
          onClick={() => void handleStart()}
        >
          {isStartingWorkflow ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Starting Workflow...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Start Workflow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
