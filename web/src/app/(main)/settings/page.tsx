"use client";

import { Bot, Info, User, Wrench } from "lucide-react";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AboutTab } from "~/features/settings/components/AboutTab";
import { AIConfigForm } from "~/features/settings/components/AIConfigForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, preferences, and workspace integrations.
        </p>
      </div>

      <Tabs defaultValue="ai-config" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="ai-config">
            <Bot className="mr-2 h-4 w-4" />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="integrations" disabled>
            <Wrench className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="mr-2 h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is a placeholder for your public profile settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Profile editing will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-config">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Customize AI behavior and provide your own API keys (BYOK).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <AIConfigForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Cognitive Cockpit</CardTitle>
              <CardDescription>
                System version and other relevant information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AboutTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
