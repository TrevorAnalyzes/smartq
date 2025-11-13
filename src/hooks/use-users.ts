import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrganizationStore } from '@/store/organization-store'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  organizationId: string
  permissions: string[]
  createdAt: Date
  lastLoginAt?: Date
  updatedAt: Date
  organization?: {
    id: string
    name: string
    domain: string
  }
}

// Fetch all users (filtered by organization)
export function useUsers(organizationId?: string) {
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const orgId = organizationId || currentOrganization?.id

  return useQuery({
    queryKey: ['users', orgId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (orgId) params.append('organizationId', orgId)

      const response = await fetch(`/api/users?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
    enabled: !!orgId,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    },
    enabled: !!id,
  })
}

// Create user (invite)
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      email: string
      name: string
      role: string
      organizationId: string
      permissions?: string[]
    }) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.organizationId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Update user
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }
      return response.json()
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      queryClient.invalidateQueries({ queryKey: ['users', updatedUser.organizationId] })
    },
  })
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

