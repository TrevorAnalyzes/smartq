// Hook for fetching and managing voice agents using TanStack Query
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { VoiceAgent } from '@/lib/types'
import { useOrganizationStore } from '@/store/organization-store'

// Fetch all agents
async function fetchAgents(
  organizationId: string,
  filters?: {
    status?: string
    accentType?: string
  }
): Promise<VoiceAgent[]> {
  const params = new URLSearchParams()
  params.append('organizationId', organizationId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.accentType) params.append('accentType', filters.accentType)

  const url = `/api/agents${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch agents')
  }

  return response.json()
}

// Fetch single agent
async function fetchAgent(id: string, organizationId: string): Promise<VoiceAgent> {
  const response = await fetch(`/api/agents/${id}?organizationId=${organizationId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch agent')
  }

  return response.json()
}

// Create new agent
async function createAgent(data: Partial<VoiceAgent>, organizationId: string): Promise<VoiceAgent> {
  const url = `/api/agents?organizationId=${organizationId}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create agent')
  }

  return response.json()
}

// Update agent
async function updateAgent(id: string, data: Partial<VoiceAgent>, organizationId: string): Promise<VoiceAgent> {
  const response = await fetch(`/api/agents/${id}?organizationId=${organizationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to update agent')
  }

  return response.json()
}

// Delete agent
async function deleteAgent(id: string, organizationId: string): Promise<void> {
  const response = await fetch(`/api/agents/${id}?organizationId=${organizationId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete agent')
  }
}

// Hook to fetch all agents
export function useAgents(filters?: { status?: string; accentType?: string }) {
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useQuery({
    queryKey: ['agents', organizationId, filters],
    queryFn: () => fetchAgents(organizationId, filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Hook to fetch agents for a specific organization (for organization management)
export function useOrganizationAgents(organizationId: string, filters?: { status?: string; accentType?: string }) {
  return useQuery({
    queryKey: ['agents', organizationId, filters],
    queryFn: () => fetchAgents(organizationId, filters),
    enabled: !!organizationId,
  })
}

// Hook to fetch single agent
export function useAgent(id: string) {
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useQuery({
    queryKey: ['agents', id, organizationId],
    queryFn: () => fetchAgent(id, organizationId),
    enabled: !!id && !!organizationId,
  })
}

// Hook to create agent
export function useCreateAgent() {
  const queryClient = useQueryClient()
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useMutation({
    mutationFn: (data: any) =>
      createAgent(
        { ...data, organizationId: data.organizationId || organizationId },
        organizationId,
      ),
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

// Hook to update agent
export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoiceAgent> }) =>
      updateAgent(id, data, organizationId),
    onSuccess: (_, variables) => {
      // Invalidate specific agent and agents list
      queryClient.invalidateQueries({ queryKey: ['agents', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

// Hook to delete agent
export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useMutation({
    mutationFn: (id: string) => deleteAgent(id, organizationId),
    onSuccess: () => {
      // Invalidate agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

