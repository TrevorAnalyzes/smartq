// Hook for fetching analytics data using TanStack Query
'use client'

import { useQuery } from '@tanstack/react-query'
import { useOrganizationStore } from '@/store/organization-store'

interface AnalyticsData {
  dateRange: {
    start: Date
    end: Date
    days: number
  }
  summary: {
    totalConversations: number
    trend: number
  }
  sentimentDistribution: Array<{
    sentiment: string
    count: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
  }>
  performanceByAgent: Array<{
    agentId: string
    agentName: string
    averageDuration: number
    totalCalls: number
  }>
  hourlyDistribution: Array<{
    hour: number
    count: number
  }>
  dailyStats?: Array<{
    date: string
    totalCalls: number
    successfulCalls: number
    successRate: number
  }>
}

async function fetchAnalytics(
  organizationId: string,
  params?: {
    days?: number
    agentId?: string
  }
): Promise<AnalyticsData> {
  const searchParams = new URLSearchParams()
  searchParams.append('organizationId', organizationId)
  if (params?.days) searchParams.append('days', params.days.toString())
  if (params?.agentId) searchParams.append('agentId', params.agentId)

  const url = `/api/analytics${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch analytics data')
  }

  return response.json()
}

export function useAnalytics(params?: {
  days?: number
  agentId?: string
  organizationId?: string
}) {
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = params?.organizationId || currentOrganization?.id

  return useQuery({
    queryKey: ['analytics', organizationId, params],
    queryFn: () => fetchAnalytics(organizationId!, params),
    refetchInterval: 60000, // Refetch every minute
    enabled: !!organizationId,
  })
}
