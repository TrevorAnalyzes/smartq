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
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const setCurrentOrganization = useOrganizationStore((state) => state.setCurrentOrganization)

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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    )
  }

  // Show error state if organizations failed to load
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">Failed to load organizations</p>
          <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  // If no organizations exist, show a message to create one
  if (data?.organizations && data.organizations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No organizations found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please create an organization to get started
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
