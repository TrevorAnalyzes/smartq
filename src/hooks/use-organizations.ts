import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrganizationStore } from '@/store/organization-store'
import type { Organization } from '@/store/organization-store'

// Fetch all organizations
export function useOrganizations() {
  const setOrganizations = useOrganizationStore(state => state.setOrganizations)
  const setCurrentOrganization = useOrganizationStore(state => state.setCurrentOrganization)
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)

  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch('/api/organizations')
      if (!response.ok) throw new Error('Failed to fetch organizations')
      const data = await response.json()

      // Update store with organizations
      setOrganizations(data.organizations)

      // If no organizations exist, clear current organization
      if (data.organizations.length === 0) {
        setCurrentOrganization(null)
      }
      // If no current organization is set, set the first one
      else if (!currentOrganization && data.organizations.length > 0) {
        setCurrentOrganization(data.organizations[0])
      }

      return data
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

// Fetch single organization
export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/${id}`)
      if (!response.ok) throw new Error('Failed to fetch organization')
      return response.json()
    },
    enabled: !!id,
  })
}

// Create organization
export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; domain: string; plan: string }) => {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create organization')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

// Update organization
export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient()
  const setCurrentOrganization = useOrganizationStore(state => state.setCurrentOrganization)
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)

  return useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update organization')
      }
      return response.json()
    },
    onSuccess: updatedOrg => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organizations', id] })

      // Update current organization if it's the one being updated
      if (currentOrganization?.id === id) {
        setCurrentOrganization(updatedOrg)
      }
    },
  })
}

// Change organization plan via billing API
export function useChangePlan() {
  const queryClient = useQueryClient()
  const setCurrentOrganization = useOrganizationStore(state => state.setCurrentOrganization)
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)

  return useMutation({
    mutationFn: async (params: {
      organizationId: string
      targetPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
    }) => {
      const response = await fetch('/api/billing/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to change plan'
        try {
          const errorBody = await response.json()
          if (errorBody?.error) errorMessage = errorBody.error
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(errorMessage)
      }

      return response.json()
    },
    onSuccess: updatedOrg => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })

      if (currentOrganization?.id === updatedOrg.id) {
        setCurrentOrganization(updatedOrg)
      }
    },
  })
}

// Delete organization
export function useDeleteOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete organization')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}
