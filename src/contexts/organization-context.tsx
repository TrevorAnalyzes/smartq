'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Organization {
  id: string
  name: string
  domain: string
  plan: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
  organization: Organization
}

interface OrganizationContextType {
  user: User | null
  organization: Organization | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadUserData = async () => {
    try {
      const supabase = createClient()

      // Get current Supabase auth user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setOrganization(null)
        setLoading(false)
        return
      }

      // Fetch user profile from Prisma database
      const response = await fetch(`/api/users?email=${encodeURIComponent(authUser.email!)}`)
      if (!response.ok) {
        throw new Error('Failed to load user profile')
      }

      const data = await response.json()
      if (!data.users || data.users.length === 0) {
        throw new Error('User profile not found')
      }

      const userData = data.users[0]
      setUser(userData)
      setOrganization(userData.organization)
    } catch (error) {
      console.error('Error loading user data:', error)
      setUser(null)
      setOrganization(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()

    // Listen for auth state changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_IN') {
        loadUserData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setOrganization(null)
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <OrganizationContext.Provider
      value={{
        user,
        organization,
        loading,
        refreshUser: loadUserData,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

