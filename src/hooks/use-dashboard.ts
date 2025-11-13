'use client'

import { useEffect } from 'react'
import { useDashboardStore } from '@/stores/dashboard-store'

export function useDashboard() {
  const {
    metrics,
    agents,
    conversations,
    loading,
    error,
    setMetrics,
    setAgents,
    setConversations,
    setLoading,
    setError,
  } = useDashboardStore()

  // Load initial dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // TODO: Replace with actual API calls
        // Example:
        // const response = await fetch('/api/dashboard')
        // const data = await response.json()
        // setMetrics(data.metrics)
        // setAgents(data.agents)
        // setConversations(data.conversations)

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [setMetrics, setAgents, setConversations, setLoading, setError])

  return {
    metrics,
    agents,
    conversations,
    loading,
    error,
  }
}
