[dev_docs/task_code/motion-1762971323896086314.ts]

[dev_docs/task_code/tooltip-1762971324266529002.tsx]

[dev_docs/task_code/skeleton-1762971324752786131.tsx]

[dev_docs/task_code/node-status-icon-1762971325339074941.tsx]

The Workflow Navigator (Panel A) and the core Cockpit Layout have been successfully implemented, fulfilling the requirements of the task.

**Key Implementation Highlights:**

1.  **Cockpit Layout (`cockpit-layout.tsx`):** The three-column layout using `react-resizable-panels` is implemented, adhering to Design Doc 5.1.1. It features persistent resizing (`autoSaveId`), collapsible sidebars, the specified visual hierarchy (`bg-card`/`bg-background`), and conditional rendering logic for the History panel (Panel C) based on the active node's state.
2.  **Hierarchical Tree View (`workflow-tree.tsx`):**
    *   Renders the `Phase -> Stage -> Node` structure accurately.
    *   Implements collapsible behavior for **both** Phases and Stages, utilizing the centralized `UIInteractionSlice` to manage the collapse state (Architecture 4.3.5).
    *   **Execution Frontier:** Efficiently calculates the `executionFrontierNodeId` to enforce access control (Design Doc N3.2).
    *   **Framer Motion:** Integrates `Layout Animations` and `AnimatePresence` (Design Doc 5.2.1) for smooth dynamic updates, utilizing the new `constants/motion.ts`.
3.  **Node Item (`node-tree-item.tsx`):** Implements the high-density design, selection logic, and all required visual indicators: status icon, staleness indicator (with Tooltip), and the active selection bar (Design Doc 5.1.2.A2).
4.  **Data Loading Orchestration (`project-workflow-container.tsx`):** The container has been refactored to manage the initialization sequence (Project Load -> Workflow Load -> WebSocket Connect) and seamlessly transitions to the `CockpitLayout` when data is ready, providing appropriate loading/error fallbacks.
5.  **Dependencies:** Added necessary helper components (`NodeStatusIcon`) and required Shadcn/ui elements (`Skeleton`, `Tooltip`).