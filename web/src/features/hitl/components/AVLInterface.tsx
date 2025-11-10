import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Markdown } from "~/components/deer-flow/markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

import type { InteractionHandler } from "../HITLController";

export interface Critique {
  id: string;
  content: string;
}

export interface AVLData {
  proposal: string;
  critiques: Critique[];
}

const adjudicationSchema = z.object({
  critique_id: z.string(),
  decision: z.enum(["Accepted", "Rejected"], {
    required_error: "A decision is required.",
  }),
  comment: z.string().optional(),
});

const formSchema = z.object({
  adjudications: z.array(adjudicationSchema).nonempty(),
});

interface AVLInterfaceProps {
  data: AVLData | null | undefined;
  onInteractionChange: InteractionHandler;
}

/**
 * Implements the AVL (Adversarial Validation Loop) HITL interface.
 * Guides reviewers through adjudicating critiques for a proposal.
 */
export function AVLInterface({ data, onInteractionChange }: AVLInterfaceProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjudications:
        data?.critiques.map((critique) => ({
          critique_id: critique.id,
          decision: undefined,
          comment: "",
        })) ?? [],
    },
    mode: "onChange",
  });

  const { formState, watch } = form;
  const adjudications = watch("adjudications");

  useEffect(() => {
    onInteractionChange({
      data: { adjudication: adjudications },
      isComplete: formState.isValid,
    });
  }, [adjudications, formState.isValid, onInteractionChange]);

  if (!data || !data.critiques || data.critiques.length === 0) {
    return <p className="text-muted-foreground">No proposal or critiques to display.</p>;
  }

  return (
    <div className="flex h-full flex-col gap-8">
      {data.proposal && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Core Proposal</h3>
          <div className="prose prose-sm max-w-none rounded-md border bg-background p-4 dark:prose-invert">
            <Markdown>{data.proposal}</Markdown>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Adjudicate Critiques</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Review and decide on each critique. The &quot;Approve&quot; button will be enabled once all
          critiques are addressed.
        </p>
        <Form {...form}>
          <form className="space-y-4">
            <Accordion type="multiple" className="w-full" defaultValue={data.critiques.map((c) => c.id)}>
              {data.critiques.map((critique, index) => (
                <AccordionItem value={critique.id} key={critique.id}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {critique.content}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 p-2">
                      <FormField
                        control={form.control}
                        name={`adjudications.${index}.decision`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={field.value === "Accepted" ? "default" : "outline"}
                                  onClick={() => field.onChange("Accepted")}
                                >
                                  Accept
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "Rejected" ? "destructive" : "outline"}
                                  onClick={() => field.onChange("Rejected")}
                                >
                                  Reject
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`adjudications.${index}.comment`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Optional: add a comment for your decision..."
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </form>
        </Form>
      </div>
    </div>
  );
}
