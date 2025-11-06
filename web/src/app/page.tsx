// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { GlobalHeader } from "~/components/workspace";
import { WorkspaceLayout } from "~/components/workspace";
import { NavigationPanel } from "~/components/workspace";
import { ContextualPanel } from "~/components/workspace";
import { MainStageContainer } from "~/components/workspace";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col">
      <GlobalHeader
        breadcrumbs={[
          { label: "🦌 DeerFlow", href: "/" },
          { label: "工作区" },
        ]}
      />
      <WorkspaceLayout
        navigation={
          <NavigationPanel activeMode="execution">
            <div className="flex-1 p-4">
              <p className="text-text-secondary">导航面板</p>
            </div>
          </NavigationPanel>
        }
        main={
          <MainStageContainer contentKey="home">
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <h1 className="mb-4 text-4xl font-bold text-text-primary">
                  🦌 DeerFlow
                </h1>
                <p className="text-lg text-text-secondary">
                  Deep Exploration and Efficient Research
                </p>
                <p className="mt-2 text-sm text-text-tertiary">
                  欢迎使用 DeerFlow 工作区
                </p>
              </div>
            </div>
          </MainStageContainer>
        }
        contextual={
          <ContextualPanel title="信息面板">
            <div className="text-sm text-text-secondary">
              <p>这是工作区的上下文面板区域。</p>
            </div>
          </ContextualPanel>
        }
      />
    </div>
  );
}

