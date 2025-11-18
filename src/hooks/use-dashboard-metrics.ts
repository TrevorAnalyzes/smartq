// Hook for fetching dashboard metrics using TanStack Query
'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardMetrics } from '@/lib/types'
import { useOrganizationStore } from '@/store/organization-store'

async function fetchDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
  const response = await fetch(`/api/dashboard?organizationId=${organizationId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard metrics')
  }

  return response.json()
}

export function useDashboardMetrics(orgId?: string) {
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = orgId || currentOrganization?.id || 'demo-org-id'

  return useQuery({
    queryKey: ['dashboard', 'metrics', organizationId],
    queryFn: () => fetchDashboardMetrics(organizationId),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    enabled: !!organizationId,
  })
}
