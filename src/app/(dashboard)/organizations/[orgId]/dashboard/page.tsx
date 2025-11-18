'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useOrganizationStore } from '@/store/organization-store'
import { useOrganization } from '@/hooks/use-organizations'
import { DashboardMetrics } from '@/components/features/dashboard-metrics'
import { RecentActivity } from '@/components/features/recent-activity'
import { PerformanceChart } from '@/components/features/performance-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Bot, MessageSquare, TrendingUp } from 'lucide-react'

export default function OrganizationDashboardPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const switchOrganization = useOrganizationStore(state => state.switchOrganization)

  const { data: orgData, isLoading, error } = useOrganization(orgId)

  useEffect(() => {
    // If the current organization doesn't match the URL, switch to it
    if (orgData && currentOrganization?.id !== orgId) {
      switchOrganization(orgId)
    }
  }, [orgId, orgData, currentOrganization, switchOrganization])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !orgData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Not Found</CardTitle>
          <CardDescription>
            The organization you're looking for doesn't exist or you don't have access to it.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const organization = orgData.organization || orgData

  return (
    <div className="space-y-6">
      {/* Organization Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count?.users || 0}</div>
            <p className="text-muted-foreground text-xs">Active users in organization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice Agents</CardTitle>
            <Bot className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count?.voiceAgents || 0}</div>
            <p className="text-muted-foreground text-xs">Deployed AI agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count?.conversations || 0}</div>
            <p className="text-muted-foreground text-xs">Total conversations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-muted-foreground text-xs">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Content - Filtered by Organization */}
      <DashboardMetrics organizationId={orgId} />

      <PerformanceChart organizationId={orgId} />

      <RecentActivity organizationId={orgId} />
    </div>
  )
}
