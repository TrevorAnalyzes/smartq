// Database Seed Script
// Run with: npm run db:seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.activity.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.voiceAgent.deleteMany()
  await prisma.user.deleteMany()
  await prisma.cRMIntegration.deleteMany()
  await prisma.organization.deleteMany()

  // Create single SmartQ demo organization
  console.log('🏢 Creating SmartQ demo organization...')

  const org = await prisma.organization.create({
    data: {
      id: 'demo-org-id', // Stable demo org id
      name: 'SmartQ Demo Org',
      domain: 'https://demo.smartq.local',
      plan: 'PRO',
      brandingPrimaryColor: '#10B981',
      brandingCompanyName: 'SmartQ',
      emailAlerts: true,
      smsAlerts: false,
    },
  })

  const organizations = [org]
  console.log(`✅ Created ${organizations.length} organization`)

  // Create users for each organization
  console.log('👥 Creating SmartQ demo users...')

  await prisma.user.create({
    data: {
      email: 'admin@smartq.local',
      name: 'SmartQ Admin',
      role: 'ADMIN',
      organizationId: org.id,
      permissions: ['manage_agents', 'manage_users', 'view_analytics', 'manage_settings'],
    },
  })

  await prisma.user.create({
    data: {
      email: 'manager@smartq.local',
      name: 'SmartQ Manager',
      role: 'MANAGER',
      organizationId: org.id,
      permissions: ['manage_agents', 'view_analytics'],
    },
  })

  await prisma.user.create({
    data: {
      email: 'agent@smartq.local',
      name: 'SmartQ Agent',
      role: 'AGENT',
      organizationId: org.id,
      permissions: ['view_analytics'],
    },
  })

  console.log('✅ Created 3 SmartQ demo users')

  // Create voice agents for SmartQ demo organization
  console.log('🤖 Creating SmartQ demo voice agents...')

  const smartQAgents = await Promise.all([
    prisma.voiceAgent.create({
      data: {
        id: 'demo-agent-1',
        name: 'Receptionist Anna',
        accentType: 'BRITISH_RP',
        status: 'ACTIVE',
        phoneNumber: '+447700900001',
        description: 'Handles incoming customer enquiries and bookings.',
        organizationId: org.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        id: 'demo-agent-2',
        name: 'Support Bot Leo',
        accentType: 'BRITISH_RP',
        status: 'ACTIVE',
        phoneNumber: '+447700900002',
        description: 'Follows up on open support tickets and collects feedback.',
        organizationId: org.id,
      },
    }),
  ])

  const [agentAnna, agentLeo] = smartQAgents
  const allAgents = smartQAgents
  console.log(`✅ Created ${allAgents.length} SmartQ voice agents`)

  // Create SmartQ conversations (small, controlled set)
  console.log('💬 Creating SmartQ conversations...')
  const now = new Date()
  const allConversations = []

  const conv1 = await prisma.conversation.create({
    data: {
      agentId: agentAnna.id,
      organizationId: org.id,
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
  allConversations.push(conv1)

  const conv2 = await prisma.conversation.create({
    data: {
      agentId: agentAnna.id,
      organizationId: org.id,
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
  allConversations.push(conv2)

  const conv3 = await prisma.conversation.create({
    data: {
      agentId: agentLeo.id,
      organizationId: org.id,
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
  allConversations.push(conv3)

  console.log(`✅ Created ${allConversations.length} SmartQ conversations`)

  // Create activities based on conversations
  console.log('📊 Creating SmartQ activities...')
  const allActivities = []

  for (const conversation of allConversations) {
    const agent = allAgents.find(a => a.id === conversation.agentId)

    const activity = await prisma.activity.create({
      data: {
        organizationId: conversation.organizationId,
        type: conversation.status === 'ENDED' ? 'call_completed' : 'call_started',
        agentName: agent?.name || 'Unknown',
        customerName: conversation.customerName,
        customerPhone: conversation.customerPhone,
        duration: conversation.duration ? `${Math.floor(conversation.duration / 60)}m ${conversation.duration % 60}s` : null,
        outcome: conversation.outcome,
        status: conversation.status.toLowerCase(),
        sentiment: conversation.sentiment,
        timestamp: conversation.createdAt,
      },
    })

    allActivities.push(activity)
  }

  console.log(`✅ Created ${allActivities.length} SmartQ activities`)

  // Optional: simple CRM integration for SmartQ
  console.log('🔗 Creating SmartQ CRM integration...')
  await prisma.cRMIntegration.create({
    data: {
      organizationId: org.id,
      provider: 'HUBSPOT',
      status: 'CONNECTED',
      lastSync: new Date(),
      contactsCount: 150,
      dealsCount: 8,
    },
  })

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   Organizations: ${organizations.length}`)
  console.log('     - SmartQ Demo Org (Pro)')
  console.log('   Users: 3')
  console.log(`   Voice Agents: ${allAgents.length}`)
  console.log(`   Conversations: ${allConversations.length}`)
  console.log(`   Activities: ${allActivities.length}`)
  console.log('   CRM Integrations: 1')
  console.log('\n🎉 You can now view the dashboard with SmartQ demo data!')
  console.log('   Run: npm run dev')
  console.log('   Open: http://localhost:3001')
  console.log('\n💡 Default organization: SmartQ Demo Org (demo-org-id)')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

