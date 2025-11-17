/* eslint-disable @typescript-eslint/no-require-imports */


'use strict'

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function ensureOrganizationColumns() {
  console.log('Ensuring Organization billing/usage tables and columns exist...')
  try {
    // New billing-related columns on Organization
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeCustomerId" text',
    )
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" text',
    )
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "monthlyCallLimit" integer',
    )

    // UsageEvent table (for billing usage & analytics)
    await prisma.$executeRawUnsafe(
      'CREATE TABLE IF NOT EXISTS "UsageEvent" (' +
        '"id" text PRIMARY KEY,' +
        '"organizationId" text NOT NULL,' +
        '"type" text NOT NULL,' +
        '"units" integer NOT NULL,' +
        '"createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
        'CONSTRAINT "UsageEvent_organizationId_fkey" FOREIGN KEY ("organizationId") ' +
        'REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE' +
      ')',
    )
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "UsageEvent_organizationId_idx" ON "UsageEvent"("organizationId")',
    )
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "UsageEvent_type_idx" ON "UsageEvent"("type")',
    )
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "UsageEvent_createdAt_idx" ON "UsageEvent"("createdAt")',
    )

    // Activity table (for recent activity feed)
    await prisma.$executeRawUnsafe(
      'CREATE TABLE IF NOT EXISTS "Activity" (' +
        '"id" text PRIMARY KEY,' +
        '"organizationId" text NOT NULL,' +
        '"type" text NOT NULL,' +
        '"agentName" text,' +
        '"customerName" text,' +
        '"customerPhone" text,' +
        '"duration" text,' +
        '"outcome" text,' +
        '"status" text,' +
        '"sentiment" "Sentiment",' +
        '"timestamp" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
        '"createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
        'CONSTRAINT "Activity_organizationId_fkey" FOREIGN KEY ("organizationId") ' +
        'REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE' +
      ')',
    )
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "Activity_organizationId_idx" ON "Activity"("organizationId")',
    )
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "Activity_type_idx" ON "Activity"("type")',
    )
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "Activity_timestamp_idx" ON "Activity"("timestamp")',
    )
  } catch (error) {
    console.error('Error ensuring Organization/UsageEvent/Activity schema:', error)
    throw error
  }
}

async function main() {
  await ensureOrganizationColumns()
  // Use a stable ID so hooks that fall back to "demo-org-id" stay consistent
  const organizationId = 'demo-org-id'

  console.log('Seeding demo organization and related data...')

  // Upsert organization so the script is idempotent
  const org = await prisma.organization.upsert({
    where: { id: organizationId },
    update: {
      name: 'SmartQ Demo Org',
      domain: 'https://demo.smartq.local',
      plan: 'PRO',
      monthlyCallLimit: 1000,
    },
    create: {
      id: organizationId,
      name: 'SmartQ Demo Org',
      domain: 'https://demo.smartq.local',
      plan: 'PRO',
      monthlyCallLimit: 1000,
    },
  })

  console.log('Organization ready:', org.id)

  // Create a couple of demo assistants
  const agent1 = await prisma.voiceAgent.upsert({
    where: { id: 'demo-agent-1' },
    update: {},
    create: {
      id: 'demo-agent-1',
      name: 'Receptionist Anna',
      status: 'ACTIVE',
      accentType: 'BRITISH_RP',
      description: 'Handles incoming customer enquiries and bookings.',
      organizationId,
    },
  })

  const agent2 = await prisma.voiceAgent.upsert({
    where: { id: 'demo-agent-2' },
    update: {},
    create: {
      id: 'demo-agent-2',
      name: 'Support Bot Leo',
      status: 'ACTIVE',
      accentType: 'BRITISH_RP',
      description: 'Follows up on open support tickets and collects feedback.',
      organizationId,
    },
  })

  console.log('Assistants ready:', agent1.id, agent2.id)

  // Create a few conversations across different statuses to feed metrics/analytics
  const now = new Date()

  const conv1 = await prisma.conversation.create({
    data: {
      agentId: agent1.id,
      organizationId,
      customerPhone: '+447700900001',
      customerName: 'Alice Johnson',
      status: 'ENDED',
      duration: 420,
      transcript: 'Customer called to confirm a booking. Call completed successfully.',
      sentiment: 'POSITIVE',
      outcome: 'Booking confirmed',
      topic: 'Booking',
      startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4),
      endedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4 + 420 * 1000),
    },
  })

  const conv2 = await prisma.conversation.create({
    data: {
      agentId: agent1.id,
      organizationId,
      customerPhone: '+447700900002',
      customerName: 'Brian Smith',
      status: 'CONNECTED',
      duration: 180,
      transcript: 'Customer asked about pricing for the Pro plan.',
      sentiment: 'NEUTRAL',
      outcome: 'Sent pricing details',
      topic: 'Pricing',
      startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    },
  })

  const conv3 = await prisma.conversation.create({
    data: {
      agentId: agent2.id,
      organizationId,
      customerPhone: '+447700900003',
      customerName: 'Carla Gomez',
      status: 'FAILED',
      duration: 30,
      transcript: 'Call dropped due to poor connection.',
      sentiment: 'NEGATIVE',
      outcome: 'Call failed',
      topic: 'Support',
      startedAt: new Date(now.getTime() - 1000 * 60 * 30),
      endedAt: new Date(now.getTime() - 1000 * 60 * 30 + 30 * 1000),
    },
  })

  console.log('Conversations created:', conv1.id, conv2.id, conv3.id)

  // Usage events to drive billing usage & analytics
  await prisma.usageEvent.createMany({
    data: [
      {
        organizationId,
        type: 'call_started',
        units: 3,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      },
      {
        organizationId,
        type: 'call_completed',
        units: 2,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      },
      {
        organizationId,
        type: 'call_failed',
        units: 1,
        createdAt: new Date(now.getTime() - 1000 * 60 * 30),
      },
    ],
    skipDuplicates: true,
  })

  console.log('Usage events seeded')

  // Recent activity feed for the dashboard
  await prisma.activity.createMany({
    data: [
      {
        organizationId,
        type: 'call_completed',
        agentName: agent1.name,
        customerName: conv1.customerName,
        customerPhone: conv1.customerPhone,
        duration: `${conv1.duration}s`,
        outcome: conv1.outcome,
        status: 'success',
        sentiment: conv1.sentiment,
        timestamp: conv1.endedAt || conv1.startedAt,
      },
      {
        organizationId,
        type: 'call_connected',
        agentName: agent1.name,
        customerName: conv2.customerName,
        customerPhone: conv2.customerPhone,
        duration: `${conv2.duration}s`,
        outcome: conv2.outcome,
        status: 'active',
        sentiment: conv2.sentiment,
        timestamp: conv2.startedAt,
      },
      {
        organizationId,
        type: 'call_failed',
        agentName: agent2.name,
        customerName: conv3.customerName,
        customerPhone: conv3.customerPhone,
        duration: `${conv3.duration}s`,
        outcome: conv3.outcome,
        status: 'failed',
        sentiment: conv3.sentiment,
        timestamp: conv3.endedAt || conv3.startedAt,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Activities seeded')

  console.log('Seeding complete.')
}

main()
  .catch((error) => {
    console.error('Error while seeding demo data:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

