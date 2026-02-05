import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Organization {
  id: string
  name: string
  domain: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  defaultAccent: string
  crmProvider?: string
  emailAlerts: boolean
  smsAlerts: boolean
  webhookUrl?: string
  brandingPrimaryColor: string
  brandingLogo?: string
  brandingCompanyName?: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    users: number
    voiceAgents: number
    conversations: number
  }
}

interface OrganizationState {
  currentOrganization: Organization | null
  organizations: Organization[]
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentOrganization: (organization: Organization | null) => void
  setOrganizations: (organizations: Organization[]) => void
  switchOrganization: (organizationId: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentOrganization: null,
  organizations: [],
  isLoading: false,
  error: null,
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentOrganization: organization => {
        set({ currentOrganization: organization, error: null })
      },

      setOrganizations: organizations => {
        set({ organizations })
      },

      switchOrganization: organizationId => {
        const { organizations } = get()
        const organization = organizations.find(org => org.id === organizationId)

        if (organization) {
          set({ currentOrganization: organization, error: null })
        } else {
          set({ error: 'Organization not found' })
        }
      },

      setLoading: isLoading => {
        set({ isLoading })
      },

      setError: error => {
        set({ error })
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'organization-storage', // localStorage key
      partialize: state => ({
        currentOrganization: state.currentOrganization,
      }),
    }
  )
)
