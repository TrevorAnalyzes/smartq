import { create } from 'zustand'
import { DashboardMetrics, VoiceAgent, Conversation } from '@/lib/types'

interface DashboardState {
  // Metrics
  metrics: DashboardMetrics | null

  // Agents
  agents: VoiceAgent[]
  selectedAgent: VoiceAgent | null

  // Conversations
  conversations: Conversation[]
  activeConversations: Conversation[]

  // UI State
  sidebarOpen: boolean
  loading: boolean
  error: string | null

  // Actions
  setMetrics: (metrics: DashboardMetrics) => void
  setAgents: (agents: VoiceAgent[]) => void
  setSelectedAgent: (agent: VoiceAgent | null) => void
  setConversations: (conversations: Conversation[]) => void
  setActiveConversations: (conversations: Conversation[]) => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed values
  getAgentById: (id: string) => VoiceAgent | undefined
  getActiveAgentsCount: () => number
  getTotalCallsToday: () => number
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  metrics: null,
  agents: [],
  selectedAgent: null,
  conversations: [],
  activeConversations: [],
  sidebarOpen: true,
  loading: false,
  error: null,

  // Actions
  setMetrics: metrics => set({ metrics }),
  setAgents: agents => set({ agents }),
  setSelectedAgent: agent => set({ selectedAgent: agent }),
  setConversations: conversations => set({ conversations }),
  setActiveConversations: conversations => set({ activeConversations: conversations }),
  setSidebarOpen: open => set({ sidebarOpen: open }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),

  // Computed values
  getAgentById: id => get().agents.find(agent => agent.id === id),
  getActiveAgentsCount: () => get().agents.filter(agent => agent.status === 'ACTIVE').length,
  getTotalCallsToday: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return get().conversations.filter(conv => conv.startedAt >= today).length
  },
}))
