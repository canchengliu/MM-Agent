"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Braces, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ManualEditSubmission } from "~/core/domain/execution.types";
import type { NodeStateVersion } from "~/core/domain/version.types";
import { useManualEditNode } from "~/features/workspace/hooks/useNodeActions";

const formSchema = z.object({
  summary: z
    .string()
    .max(200, { message: "Summary cannot exceed 200 characters." })
    .optional(),
  outputDataString: z
    .string()
    .min(1, "Output data cannot be empty.")
    .refine((val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, "Invalid JSON format. Ensure the payload is a valid JSON object."),
});

type ManualEditFormValues = z.infer<typeof formSchema>;

interface ManualEditorProps {
  baseVersion: NodeStateVersion;
  workflowId: number;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

export function ManualEditor({
  baseVersion,
  workflowId,
  onCancel,
  onSaveSuccess,
}: ManualEditorProps) {
  const { mutate: manualEdit, isPending } = useManualEditNode(workflowId);

  const form = useForm<ManualEditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: `Manually edited based on v${baseVersion.version_number}.`,
      outputDataString: JSON.stringify(baseVersion.output_data, null, 2),
    },
  });

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(form.getValues("outputDataString"));
      form.setValue("outputDataString", JSON.stringify(parsed, null, 2), {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("JSON formatted successfully.");
    } catch {
      toast.error("Could not format: Invalid JSON content.");
    }
  };

  const onSubmit = (values: ManualEditFormValues) => {
    let parsedData: Record<string, unknown>;
    try {
      const parsed = JSON.parse(values.outputDataString);
      if (
        parsed === null ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        toast.error("Save failed: Output data must be a JSON object.");
        return;
      }
      parsedData = parsed as Record<string, unknown>;
    } catch {
      // Should already be captured by validation, but guard just in case.
      toast.error("Save failed: Output data is not valid JSON.");
      return;
    }

    const payload: ManualEditSubmission = {
      base_version_id: Number(baseVersion.id),
      edited_output_data: parsedData,
      summary: values.summary,
    };

    manualEdit(
      { nodeId: baseVersion.node_instance_id, payload },
      {
        onSuccess: () => {
          onSaveSuccess();
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 items-center gap-4 border-b bg-card p-4">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Manual Editor</h2>
          <p className="text-sm text-muted-foreground">
            Injecting a new version for node:{" "}
            <span className="font-mono">
              {String(baseVersion.node_instance_id)}
            </span>
          </p>
        </div>
      </header>
      <ScrollArea className="flex-1">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Output Data</CardTitle>
                  <CardDescription>
                    Modify the JSON output of version{" "}
                    {baseVersion.version_number}. The structure must remain a
                    valid JSON object.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="outputDataString"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Node Output (JSON)</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleFormatJson}
                                >
                                  <Braces className="mr-2 h-4 w-4" />
                                  Format
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Auto-format JSON</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="h-96 min-h-[24rem] font-mono text-xs leading-relaxed"
                            placeholder="Enter valid JSON object..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edit Summary</CardTitle>
                  <CardDescription>
                    Provide a brief summary for this manual edit.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="e.g., Corrected the parameter for sensitivity analysis."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save as New Version
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
    </div>
  );
}
