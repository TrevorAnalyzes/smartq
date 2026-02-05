'use client'

import { ReactNode, useEffect } from 'react'
import { useOrganizations } from '@/hooks/use-organizations'
import { useOrganizationStore } from '@/store/organization-store'

interface OrganizationInitializerProps {
  children: ReactNode
}

export function OrganizationInitializer({ children }: OrganizationInitializerProps) {
  // This hook will automatically initialize organizations and set the current one
  const { data, isLoading, error } = useOrganizations()
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const setCurrentOrganization = useOrganizationStore(state => state.setCurrentOrganization)

  useEffect(() => {
    // If we have organizations but no current organization is set, set the first one
    if (data?.organizations && data.organizations.length > 0 && !currentOrganization) {
      setCurrentOrganization(data.organizations[0])
    }
  }, [data, currentOrganization, setCurrentOrganization])

  // Show loading state while organizations are being fetched
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground mt-2 text-sm">Loading organizations...</p>
        </div>
      </div>
    )
  }

  // Show error state if organizations failed to load
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-sm">Failed to load organizations</p>
          <p className="text-muted-foreground mt-1 text-xs">{error.message}</p>
        </div>
      </div>
    )
  }

  // If no organizations exist, show a message to create one
  if (data?.organizations && data.organizations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">No organizations found</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Please create an organization to get started
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
