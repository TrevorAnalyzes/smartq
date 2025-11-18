import { useQuery } from '@tanstack/react-query'

type BillingUsage = {
  organizationId: string
  plan: string
  periodStart: string
  used: number
  limit: number | null
  remaining: number | null
}

export function useBillingUsage(organizationId?: string) {
  return useQuery<BillingUsage>({
    queryKey: ['billing-usage', organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('organizationId is required to fetch billing usage')
      }

      const response = await fetch(`/api/billing/usage?organizationId=${organizationId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch billing usage')
      }

      return response.json()
    },
  })
}
