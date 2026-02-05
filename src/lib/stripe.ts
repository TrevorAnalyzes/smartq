import Stripe from 'stripe'

import { prisma } from '@/lib/prisma'

let stripeClient: Stripe | null = null

/**
 * Lazily initialize the Stripe client.
 *
 * In development, if STRIPE_SECRET_KEY is not set we return null and log a warning
 * so the rest of the app can still run while you're wiring up Stripe.
 */
function getStripeClient(): Stripe | null {
  if (stripeClient) return stripeClient

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Stripe is not configured (STRIPE_SECRET_KEY missing); skipping Stripe calls')
      return null
    }

    throw new Error('STRIPE_SECRET_KEY is required in production')
  }

  stripeClient = new Stripe(secretKey)
  return stripeClient
}

/**
 * Ensure the given organization has a Stripe customer and persist its ID.
 *
 * Returns the Stripe customer ID, or null if Stripe is not configured in dev.
 */
export async function ensureStripeCustomerForOrganization(
  organizationId: string
): Promise<string | null> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } })

  if (!org) {
    throw new Error(`Organization not found: ${organizationId}`)
  }

  if (org.stripeCustomerId) {
    return org.stripeCustomerId
  }

  const stripe = getStripeClient()
  if (!stripe) {
    // Dev mode without Stripe configured: no-op, but app continues to work.
    return null
  }

  const customer = await stripe.customers.create({
    name: org.name,
    metadata: {
      organizationId: org.id,
      domain: org.domain,
    },
  })

  await prisma.organization.update({
    where: { id: org.id },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

/**
 * Create or update a Stripe subscription for the organization and store its ID.
 *
 * This is a skeleton helper; callers should supply the correct Stripe Price ID
 * for the desired plan (e.g. your PRO or ENTERPRISE price).
 */
export async function attachSubscriptionToOrganization(params: {
  organizationId: string
  priceId: string
  trialPeriodDays?: number
}) {
  const { organizationId, priceId, trialPeriodDays } = params

  const stripe = getStripeClient()
  if (!stripe) {
    // Dev mode without Stripe configured: no-op.
    return null
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } })

  if (!org) {
    throw new Error(`Organization not found: ${organizationId}`)
  }

  const customerId =
    org.stripeCustomerId || (await ensureStripeCustomerForOrganization(organizationId))

  if (!customerId) {
    // Stripe not configured in dev; nothing to do.
    return null
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialPeriodDays,
    metadata: {
      organizationId,
    },
  })

  await prisma.organization.update({
    where: { id: organizationId },
    data: { stripeSubscriptionId: subscription.id },
  })

  return subscription
}

/**
 * Cancel the active Stripe subscription for an organization and clear its ID.
 *
 * In development without Stripe configured, this will simply clear the ID in the database.
 */
export async function cancelSubscriptionForOrganization(organizationId: string) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } })

  if (!org) {
    throw new Error(`Organization not found: ${organizationId}`)
  }

  if (!org.stripeSubscriptionId) {
    return null
  }

  const stripe = getStripeClient()
  if (!stripe) {
    // Dev mode without Stripe configured: just clear the subscription ID.
    await prisma.organization.update({
      where: { id: organizationId },
      data: { stripeSubscriptionId: null },
    })
    return null
  }

  try {
    await stripe.subscriptions.cancel(org.stripeSubscriptionId)
  } catch (error) {
    // If the subscription is already cancelled or not found, log and continue.
    console.warn('Failed to cancel Stripe subscription', error)
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { stripeSubscriptionId: null },
  })

  return true
}
