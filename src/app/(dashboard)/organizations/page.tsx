'use client'

import { OrganizationsList } from '@/components/features/organizations-list'
import { TeamManagement } from '@/components/features/team-management'
import { OrganizationSettings } from '@/components/features/organization-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Users, Settings } from 'lucide-react'

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
        <p className="text-muted-foreground">Manage organizations, team members, and settings</p>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-6">
          <OrganizationsList />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <OrganizationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
