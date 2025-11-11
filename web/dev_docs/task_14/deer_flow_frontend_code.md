--- (2750-2757 lines) ---
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react";


--- (2767-2767 lines) ---
import "@xyflow/react/dist/style.css";


--- (2788-2792 lines) ---
const nodeTypes = {
  circle: CircleNode,
  agent: AgentNode,
  default: AgentNode,
};


--- (2837-2860 lines) ---
      <ReactFlow
        className={cn("flex min-h-0 flex-grow")}
        style={{
          ["--xy-background-color-default" as string]: "transparent",
        }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        panOnScroll={false}
        zoomOnScroll={false}
        preventScrolling={false}
        panOnDrag={false}
        onInit={(instance) => {
          flowRef.current = instance;
        }}
      >
        <Background
          className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
          bgColor="var(--background)"
        />
        <div


--- (2961-3053 lines) ---
function AgentNode({
  data,
  id,
}: {
  data: {
    icon?: LucideIcon;
    label: string;
    active: boolean;
    stepDescription?: string;
    stepTooltipPosition?: "left" | "right" | "top" | "bottom";
  };
  id: string;
}) {
  return (
    <>
      {data.active && (
        <ShineBorder
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          className="rounded-[2px]"
        />
      )}
      <Tooltip
        className="max-w-50 text-[15px] font-light opacity-70"
        style={{
          ["--primary" as string]: "#333",
          ["--primary-foreground" as string]: "white",
        }}
        open={data.active && !!data.stepDescription}
        title={data.stepDescription}
        side={data.stepTooltipPosition}
        sideOffset={20}
      >
        <div
          id={id}
          className="relative flex w-full items-center justify-center text-xs"
        >
          <div className="flex items-center gap-2">
            {data.icon && <data.icon className="h-[1rem] w-[1rem]" />}
            <span>{data.label}</span>
          </div>
        </div>
      </Tooltip>
      <Handle
        className="invisible"
        type="source"
        position={Position.Left}
        id="left"
      />
      <Handle
        className="invisible"
        type="source"
        position={Position.Right}
        id="right"
      />
      <Handle
        className="invisible"
        type="source"
        position={Position.Top}
        id="top"
      />
      <Handle
        className="invisible"
        type="source"
        position={Position.Bottom}
        id="bottom"
      />
      <Handle
        className="invisible"
        type="target"
        position={Position.Left}
        id="left"
      />
      <Handle
        className="invisible"
        type="target"
        position={Position.Right}
        id="right"
      />
      <Handle
        className="invisible"
        type="target"
        position={Position.Top}
        id="top"
      />
      <Handle
        className="invisible"
        type="target"
        position={Position.Bottom}
        id="bottom"
      />
    </>
  );
}


--- (3382-3569 lines) ---
### app/landing/store/graph.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { Edge, Node } from "@xyflow/react";
import {
  Brain,
  FilePen,
  MessageSquareQuote,
  Microscope,
  SquareTerminal,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type GraphNode = Node<{
  label: string;
  icon?: LucideIcon;
  active?: boolean;
}>;

export type Graph = {
  nodes: GraphNode[];
  edges: Edge[];
};

const ROW_HEIGHT = 85;
const ROW_1 = 0;
const ROW_2 = ROW_HEIGHT;
const ROW_3 = ROW_HEIGHT * 2;
const ROW_4 = ROW_HEIGHT * 2;
const ROW_5 = ROW_HEIGHT * 3;
const ROW_6 = ROW_HEIGHT * 4;

export const graph: Graph = {
  nodes: [
    {
      id: "Start",
      type: "circle",
      data: { label: "Start" },
      position: { x: -75, y: ROW_1 },
    },
    {
      id: "Coordinator",
      data: { icon: MessageSquareQuote, label: "Coordinator" },
      position: { x: 150, y: ROW_1 },
    },
    {
      id: "Planner",
      data: { icon: Brain, label: "Planner" },
      position: { x: 150, y: ROW_2 },
    },
    {
      id: "Reporter",
      data: { icon: FilePen, label: "Reporter" },
      position: { x: 275, y: ROW_3 },
    },
    {
      id: "HumanFeedback",
      data: { icon: UserCheck, label: "Human Feedback" },
      position: { x: 25, y: ROW_4 },
    },
    {
      id: "ResearchTeam",
      data: { icon: Users, label: "Research Team" },
      position: { x: 25, y: ROW_5 },
    },
    {
      id: "Researcher",
      data: { icon: Microscope, label: "Researcher" },
      position: { x: -75, y: ROW_6 },
    },
    {
      id: "Coder",
      data: { icon: SquareTerminal, label: "Coder" },
      position: { x: 125, y: ROW_6 },
    },
    {
      id: "End",
      type: "circle",
      data: { label: "End" },
      position: { x: 330, y: ROW_6 },
    },
  ],
  edges: [
    {
      id: "Start->Coordinator",
      source: "Start",
      target: "Coordinator",
      sourceHandle: "right",
      targetHandle: "left",
      animated: true,
    },
    {
      id: "Coordinator->Planner",
      source: "Coordinator",
      target: "Planner",
      sourceHandle: "bottom",
      targetHandle: "top",
      animated: true,
    },
    {
      id: "Planner->Reporter",
      source: "Planner",
      target: "Reporter",
      sourceHandle: "right",
      targetHandle: "top",
      animated: true,
    },
    {
      id: "Planner->HumanFeedback",
      source: "Planner",
      target: "HumanFeedback",
      sourceHandle: "left",
      targetHandle: "top",
      animated: true,
    },
    {
      id: "HumanFeedback->Planner",
      source: "HumanFeedback",
      target: "Planner",
      sourceHandle: "right",
      targetHandle: "bottom",
      animated: true,
    },
    {
      id: "HumanFeedback->ResearchTeam",
      source: "HumanFeedback",
      target: "ResearchTeam",
      sourceHandle: "bottom",
      targetHandle: "top",
      animated: true,
    },
    {
      id: "Reporter->End",
      source: "Reporter",
      target: "End",
      sourceHandle: "bottom",
      targetHandle: "top",
      animated: true,
    },
    {
      id: "ResearchTeam->Researcher",
      source: "ResearchTeam",
      target: "Researcher",
      sourceHandle: "left",
      targetHandle: "top",
      animated: true,
    },
    {
      id: "ResearchTeam->Coder",
      source: "ResearchTeam",
      target: "Coder",
      sourceHandle: "bottom",
      targetHandle: "left",
      animated: true,
    },
    {
      id: "ResearchTeam->Planner",
      source: "ResearchTeam",
      target: "Planner",
      sourceHandle: "right",
      targetHandle: "bottom",
      animated: true,
    },
    {
      id: "Researcher->ResearchTeam",
      source: "Researcher",
      target: "ResearchTeam",
      sourceHandle: "right",
      targetHandle: "bottom",
      animated: true,
    },
    {
      id: "Coder->ResearchTeam",
      source: "Coder",
      target: "ResearchTeam",
      sourceHandle: "top",
      targetHandle: "right",
      animated: true,
    },
  ],
};

```


--- (12365-12428 lines) ---
export const useStore = create<{
  responding: boolean;
  threadId: string | undefined;
  messageIds: string[];
  messages: Map<string, Message>;
  researchIds: string[];
  researchPlanIds: Map<string, string>;
  researchReportIds: Map<string, string>;
  researchActivityIds: Map<string, string[]>;
  ongoingResearchId: string | null;
  openResearchId: string | null;

  appendMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  updateMessages: (messages: Message[]) => void;
  openResearch: (researchId: string | null) => void;
  closeResearch: () => void;
  setOngoingResearch: (researchId: string | null) => void;
}>((set) => ({
  responding: false,
  threadId: THREAD_ID,
  messageIds: [],
  messages: new Map<string, Message>(),
  researchIds: [],
  researchPlanIds: new Map<string, string>(),
  researchReportIds: new Map<string, string>(),
  researchActivityIds: new Map<string, string[]>(),
  ongoingResearchId: null,
  openResearchId: null,

  appendMessage(message: Message) {
    set((state) => {
      // Prevent duplicate message IDs in the array to avoid React key warnings
      const newMessageIds = state.messageIds.includes(message.id)
        ? state.messageIds
        : [...state.messageIds, message.id];
      return {
        messageIds: newMessageIds,
        messages: new Map(state.messages).set(message.id, message),
      };
    });
  },
  updateMessage(message: Message) {
    set((state) => ({
      messages: new Map(state.messages).set(message.id, message),
    }));
  },
  updateMessages(messages: Message[]) {
    set((state) => {
      const newMessages = new Map(state.messages);
      messages.forEach((m) => newMessages.set(m.id, m));
      return { messages: newMessages };
    });
  },
  openResearch(researchId: string | null) {
    set({ openResearchId: researchId });
  },
  closeResearch() {
    set({ openResearchId: null });
  },
  setOngoingResearch(researchId: string | null) {
    set({ ongoingResearchId: researchId });
  },
}));


--- (12734-12740 lines) ---
export function useResearchMessage(researchId: string) {
  return useStore(
    useShallow((state) => {
      const messageId = state.researchPlanIds.get(researchId);
      return messageId ? state.messages.get(messageId) : undefined;
    }),
  );


--- (1233-1239 lines) ---
  const plan = useMemo<{
    title?: string;
    thought?: string;
    steps?: { title?: string; description?: string; tools?: string[] }[];
  }>(() => {
    return parseJSON(message.content ?? "", {});
  }, [message.content]);


--- (13444-13535 lines) ---
:root {
  --radius: 0.625rem;
  --app-background: #fffaf5;
  --background: oklch(1 0 0);
  --foreground: rgba(0, 0, 0, 0.72);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --brand: #007aff;

  --novel-highlight-default: #ffffff;
  --novel-highlight-purple: #f6f3f8;
  --novel-highlight-red: #fdebeb;
  --novel-highlight-yellow: #fbf4a2;
  --novel-highlight-blue: #c1ecf9;
  --novel-highlight-green: #acf79f;
  --novel-highlight-orange: #faebdd;
  --novel-highlight-pink: #faf1f5;
  --novel-highlight-gray: #f1f1ef;
}

.dark {
  --background: oklch(0.145 0 0);
  --app-background: var(--background);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 20%);
  --input: oklch(1 0 0 / 25%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
  --brand: rgb(17, 103, 234);

  --novel-highlight-default: #000000;
  --novel-highlight-purple: #3f2c4b;
  --novel-highlight-red: #5c1a1a;
  --novel-highlight-yellow: #5c4b1a;
  --novel-highlight-blue: #1a3d5c;
  --novel-highlight-green: #1a5c20;
  --novel-highlight-orange: #5c3a1a;
  --novel-highlight-pink: #5c1a3a;
  --novel-highlight-gray: #3a3a3a;
}
