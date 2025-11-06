export interface HitlInteractionProps<TData = unknown, TFeedback = unknown> {
  projectId: string;
  interactionData: TData;
  clientCheckpointId: string;
  onSubmit: (feedback: TFeedback) => void | Promise<void>;
  isSubmitting: boolean;
}

export type HitlMode = "VARL" | "SCA" | "AVL";
