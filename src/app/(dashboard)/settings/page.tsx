'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralSettingsTab } from '@/components/features/general-settings-tab'
import { IntegrationsSettingsTab } from '@/components/features/integrations-settings-tab'
import { NotificationsSettingsTab } from '@/components/features/notifications-settings-tab'
import { Settings, Plug, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings & Configuration</h1>
        <p className="text-muted-foreground">
          Manage your organization settings, integrations, and notification preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettingsTab />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsSettingsTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
