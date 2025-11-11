--- (14-15 lines) ---
4.  **用户主权（Design Doc 1.3.2）：** 架构必须支持明确的用户意图和“静默状态管理”（1.4），在不触发自动操作的情况下可视化数据陈旧性。



--- (67-67 lines) ---
│   │   │       │       │   ├── HistoryTab.tsx


--- (84-84 lines) ---
│   │   ├── StalenessIndicator.tsx


--- (336-341 lines) ---
  refreshWorkflow: async () => {
    const workflowId = get().workflow?.id;
    if (workflowId) {
      await get().loadWorkflow(workflowId);
    }
  },


--- (379-393 lines) ---
interface InspectorState {
  selectedNodeId: number | null;
  activeTab: 'results' | 'history' | 'dependencies';
  isPanelOpen: boolean;
  isEditing: boolean; // 手动编辑模式（R4）

  // 选定节点的缓存数据
  details: NodeDetailView | null;
  versionHistory: NodeVersionRead[] | null;
  isLoadingDetails: boolean;

  // 动作
  selectNode: (nodeId: number) => Promise<void>;
  clearSelection: () => void;
  // ... 其他 UI 状态动作 (setActiveTab, togglePanel, enterEditMode)


--- (399-407 lines) ---
  selectNode: async (nodeId) => {
    set({ selectedNodeId: nodeId, isPanelOpen: true, isLoadingDetails: true, details: null, versionHistory: null });
    try {
      // 并行获取详情（API 5.1.1）和版本（API 5.1.2）
      const [details, versions] = await Promise.all([
        NodeService.getDetail(nodeId),
        NodeService.getVersions(nodeId),
      ]);
      set({ details, versionHistory: versions, isLoadingDetails: false });


--- (581-585 lines) ---
    case EventType.NODE_ACTIVE_VERSION_CHANGED:
      // 此事件表示下游可能存在陈旧性。
      // 触发完全刷新以获取更新的 'is_stale' 标志 (Design Doc 5.2)。
      store.refreshWorkflow();
      break;


--- (720-722 lines) ---
        {/* 陈旧性指示器 (Design Doc 5.1.2.1) */}
        {data.is_stale && <StalenessIndicator />}
      </Card>


--- (746-749 lines) ---
  // 1. 如果存在，显示陈旧性警告 (Design Doc 3.1.2.3)
  if (node.is_stale && node.staleness_report) {
    // 渲染 Alert 组件
  }
