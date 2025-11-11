--- (30-30 lines) ---
| **动画与效果** | Framer Motion, Magic UI | 功能动画、过渡和视觉效果。 |


--- (55-56 lines) ---
│   │   │       │   │   ├── WorkflowCanvas.tsx
│   │   │       │   │   ├── CustomNode.tsx


--- (64-64 lines) ---
│   │   │       │       ├── InspectorPanel.tsx


--- (87-87 lines) ---
│   ├── /magicui/                # 视觉效果组件 (例如, BorderBeam)


--- (119-119 lines) ---
│   ├── motion-tokens.ts         # Framer Motion 参数 (4.2.2.3)


--- (695-695 lines) ---
import { BorderBeam } from '~/components/magicui/border-beam'; // Magic UI 集成


--- (707-710 lines) ---
        {/* Executing 状态的动态 BorderBeam (Design Doc 5.1.2.1) */}
        {isExecuting && (
            <BorderBeam size={200} duration={5} delay={0} />
        )}


--- (863-872 lines) ---
#### 6.2 动态系统 (Framer Motion)

功能动态设计的实现（Design Doc 4.2）。

  * **`styles/motion-tokens.ts`：** 持续时间和缓动函数的集中式常量 (4.2.2.3)。
  * **用法：**
      * `InspectorPanel` 中的 `AnimatePresence`，用于在选择节点时平滑内容切换 (5.2.4)。
      * `WorkflowCanvas` 中的 `layout` 动画，用于结构更新时平滑重新定位 (5.2.2)。
      * 动态出现新节点时的交错动画。

