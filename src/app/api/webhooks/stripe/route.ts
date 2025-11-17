import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

import { prisma } from '@/lib/prisma'

function getStripeForWebhooks(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Stripe is not configured for webhooks (STRIPE_SECRET_KEY missing)')
      return null
    }
    throw new Error('STRIPE_SECRET_KEY is required for Stripe webhooks in production')
  }

  return new Stripe(secretKey)
}

function resolvePlanFromPriceId(priceId: string | null | undefined): 'FREE' | 'PRO' | 'ENTERPRISE' | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'PRO'
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'ENTERPRISE'
  return null
}

export async function POST(req: NextRequest) {
  const stripe = getStripeForWebhooks()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Stripe webhook secret or client missing; skipping webhook handling')
      return NextResponse.json({ received: true, ignored: true })
    }

    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 500 })
  }

  const signature = (await headers()).get('stripe-signature')
  const body = await req.text()

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId as string | undefined

        if (!organizationId) {
          console.warn('Stripe subscription event without organizationId metadata')
          break
        }

        const item = subscription.items.data[0]
        const priceId = item?.price?.id
        const derivedPlan = resolvePlanFromPriceId(priceId)

        if (event.type === 'customer.subscription.deleted') {
          // Downgrade to FREE on cancellation
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              plan: 'FREE',
              stripeSubscriptionId: null,
            },
          })
        } else {
          const status = subscription.status
          if (status === 'active' || status === 'trialing') {
            const planToSet = derivedPlan ?? 'PRO'
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                plan: planToSet,
                stripeSubscriptionId: subscription.id,
              },
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn('Stripe invoice payment failed', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        })
        break
      }

      default:
        // For now, just acknowledge other events without action.
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling Stripe webhook', error)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }
}

