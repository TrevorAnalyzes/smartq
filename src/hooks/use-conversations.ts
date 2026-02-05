// Hook for fetching and managing conversations using TanStack Query
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Conversation } from '@/lib/types'
import { useOrganizationStore } from '@/store/organization-store'

interface ConversationsResponse {
  conversations: Conversation[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Fetch all conversations
async function fetchConversations(
  organizationId: string,
  filters?: {
    status?: string
    agentId?: string
    sentiment?: string
    limit?: number
    offset?: number
  }
): Promise<ConversationsResponse> {
  const params = new URLSearchParams()
  params.append('organizationId', organizationId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.agentId) params.append('agentId', filters.agentId)
  if (filters?.sentiment) params.append('sentiment', filters.sentiment)
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.offset) params.append('offset', filters.offset.toString())

  const url = `/api/conversations${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch conversations')
  }

  return response.json()
}

// Fetch single conversation
async function fetchConversation(id: string, organizationId: string): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}?organizationId=${organizationId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch conversation')
  }

  return response.json()
}

// Create new conversation
async function createConversation(
  data: Partial<Conversation>,
  organizationId: string
): Promise<Conversation> {
  const response = await fetch(`/api/conversations?organizationId=${organizationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create conversation')
  }

  return response.json()
}

// Update conversation
async function updateConversation(
  id: string,
  data: Partial<Conversation>,
  organizationId: string
): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}?organizationId=${organizationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to update conversation')
  }

  return response.json()
}

// Delete conversation
async function deleteConversation(id: string, organizationId: string): Promise<void> {
  const response = await fetch(`/api/conversations/${id}?organizationId=${organizationId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete conversation')
  }
}

// Hook to fetch all conversations
export function useConversations(filters?: {
  status?: string
  agentId?: string
  sentiment?: string
  limit?: number
  offset?: number
}) {
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = currentOrganization?.id

  return useQuery({
    queryKey: ['conversations', organizationId, filters],
    queryFn: () => fetchConversations(organizationId!, filters),
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
    enabled: !!organizationId,
  })
}

// Hook to fetch conversations for a specific organization (for organization management)
export function useOrganizationConversations(
  organizationId: string,
  filters?: {
    status?: string
    agentId?: string
    sentiment?: string
    limit?: number
    offset?: number
  }
) {
  return useQuery({
    queryKey: ['conversations', organizationId, filters],
    queryFn: () => fetchConversations(organizationId, filters),
    enabled: !!organizationId,
  })
}

// Hook to fetch single conversation
export function useConversation(id: string) {
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useQuery({
    queryKey: ['conversations', id, organizationId],
    queryFn: () => fetchConversation(id, organizationId),
    enabled: !!id && !!organizationId,
  })
}

// Hook to create conversation
export function useCreateConversation() {
  const queryClient = useQueryClient()
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useMutation({
    mutationFn: (data: Partial<Conversation>) => createConversation(data, organizationId),
    onSuccess: () => {
      // Invalidate and refetch conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Hook to update conversation
export function useUpdateConversation() {
  const queryClient = useQueryClient()
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = currentOrganization?.id

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Conversation> }) => {
      if (!organizationId) throw new Error('No organization selected')
      return updateConversation(id, data, organizationId)
    },
    onSuccess: (_, variables) => {
      // Invalidate specific conversation and conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Hook to delete conversation
export function useDeleteConversation() {
  const queryClient = useQueryClient()
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = currentOrganization?.id || 'demo-org-id'

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id, organizationId),
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
