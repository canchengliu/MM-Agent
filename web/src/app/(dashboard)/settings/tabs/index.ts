import { Brain, Cpu, Palette } from "lucide-react";

import { AiBehaviorSettingsTab } from "./ai-behavior-tab";
import { EngineSettingsTab } from "./engine-tab";
import { InterfaceSettingsTab } from "./interface-tab";
import type { SettingsTabDefinition } from "./types";

export const SETTINGS_TABS: SettingsTabDefinition[] = [
  {
    id: "interface",
    label: "界面偏好",
    description: "切换界面语言与主题，立即应用到整个控制台。",
    icon: Palette,
    component: InterfaceSettingsTab,
  },
  {
    id: "engine",
    label: "工作流引擎 (BYOK)",
    description: "配置自定义模型、终端地址以及私有 API Key。",
    icon: Cpu,
    component: EngineSettingsTab,
  },
  {
    id: "behavior",
    label: "AI 行为",
    description: "调节 HITL Profile 与思考深度，控制交互风格与穷举程度。",
    icon: Brain,
    component: AiBehaviorSettingsTab,
  },
];
