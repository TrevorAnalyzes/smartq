// Hook for fetching activities using TanStack Query
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrganizationStore } from '@/store/organization-store'

interface Activity {
  id: string
  type: string
  agentName?: string
  customerName?: string
  customerPhone?: string
  duration?: string
  outcome?: string
  status?: string
  sentiment?: string
  timestamp: Date
}

interface ActivitiesResponse {
  activities: Activity[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

async function fetchActivities(
  organizationId: string,
  params?: {
    limit?: number
    offset?: number
  }
): Promise<ActivitiesResponse> {
  const searchParams = new URLSearchParams()
  searchParams.append('organizationId', organizationId)
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.offset) searchParams.append('offset', params.offset.toString())

  const url = `/api/activities${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch activities')
  }

  return response.json()
}

async function createActivity(data: Partial<Activity>): Promise<Activity> {
  const response = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create activity')
  }

  return response.json()
}

export function useActivities(organizationId?: string, params?: { limit?: number; offset?: number }) {
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const orgId = organizationId || currentOrganization?.id || 'demo-org-id'

  return useQuery({
    queryKey: ['activities', orgId, params],
    queryFn: () => fetchActivities(orgId, params),
    refetchInterval: 15000, // Refetch every 15 seconds
    enabled: !!orgId,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      // Invalidate and refetch activities list
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

