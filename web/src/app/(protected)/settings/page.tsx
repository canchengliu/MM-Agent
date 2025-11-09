// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { AccountForm } from "./components/account-form";
import { EngineForm } from "./components/engine-form";
import { InterfaceForm } from "./components/interface-form";

export default function SettingsPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
          <CardDescription>
            Manage your account settings, interface preferences, and configure the workflow engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsTabs />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsTabs() {
  return (
    <Tabs defaultValue="account" className="space-y-4">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="interface">Interface</TabsTrigger>
        <TabsTrigger value="engine">Workflow Engine</TabsTrigger>
      </TabsList>
      <Separator />
      <div className="pt-4">
        <TabsContent value="account" className="space-y-6">
          <AccountForm />
        </TabsContent>
        <TabsContent value="interface" className="space-y-6">
          <InterfaceForm />
        </TabsContent>
        <TabsContent value="engine" className="space-y-6">
          <EngineForm />
        </TabsContent>
      </div>
    </Tabs>
  );
}
