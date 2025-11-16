export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE'

export type FeatureKey = 'CALLS' | 'ANALYTICS'

/**
 * Minimal feature gating helper.
 *
 * This is intentionally simple; as you add more features/plans,
 * move the rules into a config object or database table.
 */
export function hasFeature(plan: Plan, feature: FeatureKey): boolean {
  if (plan === 'ENTERPRISE') return true

  if (plan === 'PRO') {
    // Example rules: PRO gets calls + basic analytics
    if (feature === 'CALLS') return true
    if (feature === 'ANALYTICS') return true
  }

  // FREE plan: allow only the most basic features (e.g. calls)
  if (plan === 'FREE') {
    return feature === 'CALLS'
  }

  return false
}

