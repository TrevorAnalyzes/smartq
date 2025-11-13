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

  // Create multiple demo organizations
  console.log('🏢 Creating demo organizations...')

  // Organization 1: TechCorp UK
  const org1 = await prisma.organization.create({
    data: {
      id: 'org-techcorp-uk',
      name: 'TechCorp UK Ltd',
      domain: 'https://techcorp.co.uk',
      plan: 'ENTERPRISE',
      brandingPrimaryColor: '#0066CC',
      brandingCompanyName: 'TechCorp UK',
      emailAlerts: true,
      smsAlerts: true,
    },
  })

  // Organization 2: HealthPlus (default - will be selected by default)
  const org2 = await prisma.organization.create({
    data: {
      id: 'demo-org-id', // Keep this as default
      name: 'HealthPlus Medical Services',
      domain: 'https://healthplus.co.uk',
      plan: 'PRO',
      brandingPrimaryColor: '#10B981',
      brandingCompanyName: 'HealthPlus',
      emailAlerts: true,
      smsAlerts: false,
    },
  })

  // Organization 3: RetailHub
  const org3 = await prisma.organization.create({
    data: {
      id: 'org-retailhub',
      name: 'RetailHub Commerce',
      domain: 'https://retailhub.co.uk',
      plan: 'FREE',
      brandingPrimaryColor: '#F59E0B',
      brandingCompanyName: 'RetailHub',
      emailAlerts: true,
      smsAlerts: false,
    },
  })

  const organizations = [org1, org2, org3]
  console.log(`✅ Created ${organizations.length} organizations`)

  // Create users for each organization
  console.log('👥 Creating demo users...')

  // TechCorp users
  await prisma.user.create({
    data: {
      email: 'admin@techcorp.co.uk',
      name: 'Sarah Mitchell',
      role: 'ADMIN',
      organizationId: org1.id,
      permissions: ['manage_agents', 'manage_users', 'view_analytics', 'manage_settings'],
    },
  })

  await prisma.user.create({
    data: {
      email: 'manager@techcorp.co.uk',
      name: 'James Thompson',
      role: 'MANAGER',
      organizationId: org1.id,
      permissions: ['manage_agents', 'view_analytics'],
    },
  })

  // HealthPlus users
  await prisma.user.create({
    data: {
      email: 'admin@healthplus.co.uk',
      name: 'Dr. Emily Watson',
      role: 'ADMIN',
      organizationId: org2.id,
      permissions: ['manage_agents', 'manage_users', 'view_analytics', 'manage_settings'],
    },
  })

  await prisma.user.create({
    data: {
      email: 'manager@healthplus.co.uk',
      name: 'Michael Brown',
      role: 'MANAGER',
      organizationId: org2.id,
      permissions: ['manage_agents', 'view_analytics'],
    },
  })

  await prisma.user.create({
    data: {
      email: 'agent@healthplus.co.uk',
      name: 'Sophie Davies',
      role: 'AGENT',
      organizationId: org2.id,
      permissions: ['view_analytics'],
    },
  })

  // RetailHub users
  await prisma.user.create({
    data: {
      email: 'admin@retailhub.co.uk',
      name: 'David Wilson',
      role: 'ADMIN',
      organizationId: org3.id,
      permissions: ['manage_agents', 'manage_users', 'view_analytics', 'manage_settings'],
    },
  })

  await prisma.user.create({
    data: {
      email: 'viewer@retailhub.co.uk',
      name: 'Emma Roberts',
      role: 'VIEWER',
      organizationId: org3.id,
      permissions: [],
    },
  })

  console.log('✅ Created 7 users across all organizations')

  // Create voice agents for each organization
  console.log('🤖 Creating voice agents...')

  // TechCorp agents (4 agents)
  const techCorpAgents = await Promise.all([
    prisma.voiceAgent.create({
      data: {
        name: 'Alexander',
        accentType: 'BRITISH_RP',
        status: 'ACTIVE',
        phoneNumber: '+442071111001',
        description: 'Enterprise sales specialist with British RP accent',
        organizationId: org1.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Victoria',
        accentType: 'BRITISH_RP',
        status: 'ACTIVE',
        phoneNumber: '+442071111002',
        description: 'Technical support expert with professional tone',
        organizationId: org1.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Benjamin',
        accentType: 'BRITISH_SCOTTISH',
        status: 'ACTIVE',
        phoneNumber: '+442071111003',
        description: 'Customer success manager with Scottish accent',
        organizationId: org1.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Isabella',
        accentType: 'BRITISH_NORTHERN',
        status: 'INACTIVE',
        phoneNumber: '+442071111004',
        description: 'Account manager with Northern accent',
        organizationId: org1.id,
      },
    }),
  ])

  // HealthPlus agents (5 agents - default org)
  const healthPlusAgents = await Promise.all([
    prisma.voiceAgent.create({
      data: {
        name: 'Sarah',
        accentType: 'BRITISH_RP',
        status: 'ACTIVE',
        phoneNumber: '+442072222001',
        description: 'Medical appointment scheduler with British RP accent',
        organizationId: org2.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'James',
        accentType: 'BRITISH_RP',
        status: 'ACTIVE',
        phoneNumber: '+442072222002',
        description: 'Patient support specialist with warm, professional tone',
        organizationId: org2.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Emily',
        accentType: 'BRITISH_COCKNEY',
        status: 'ACTIVE',
        phoneNumber: '+442072222003',
        description: 'Friendly reception agent with London accent',
        organizationId: org2.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Oliver',
        accentType: 'BRITISH_SCOTTISH',
        status: 'INACTIVE',
        phoneNumber: '+442072222004',
        description: 'Prescription refill specialist with Scottish accent',
        organizationId: org2.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Charlotte',
        accentType: 'BRITISH_WELSH',
        status: 'MAINTENANCE',
        phoneNumber: '+442072222005',
        description: 'Patient follow-up specialist with Welsh accent',
        organizationId: org2.id,
      },
    }),
  ])

  // RetailHub agents (3 agents)
  const retailHubAgents = await Promise.all([
    prisma.voiceAgent.create({
      data: {
        name: 'Lucy',
        accentType: 'BRITISH_RP',
        status: 'ACTIVE',
        phoneNumber: '+442073333001',
        description: 'Order tracking and customer service agent',
        organizationId: org3.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Thomas',
        accentType: 'BRITISH_COCKNEY',
        status: 'ACTIVE',
        phoneNumber: '+442073333002',
        description: 'Returns and refunds specialist with London accent',
        organizationId: org3.id,
      },
    }),
    prisma.voiceAgent.create({
      data: {
        name: 'Grace',
        accentType: 'BRITISH_NORTHERN',
        status: 'INACTIVE',
        phoneNumber: '+442073333003',
        description: 'Product inquiry specialist with Northern accent',
        organizationId: org3.id,
      },
    }),
  ])

  const allAgents = [...techCorpAgents, ...healthPlusAgents, ...retailHubAgents]
  console.log(`✅ Created ${allAgents.length} voice agents (TechCorp: ${techCorpAgents.length}, HealthPlus: ${healthPlusAgents.length}, RetailHub: ${retailHubAgents.length})`)

  // Create conversations for each organization
  console.log('💬 Creating conversations...')
  const now = new Date()
  const allConversations = []

  // Helper function to create random date within last 7 days
  const randomDate = (daysAgo: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))
    return date
  }

  const statuses: Array<'CONNECTED' | 'RINGING' | 'ENDED' | 'FAILED'> = [
    'ENDED',
    'ENDED',
    'ENDED',
    'ENDED',
    'ENDED',
    'CONNECTED',
    'RINGING',
    'FAILED',
  ]
  const sentiments: Array<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']
  const outcomes: Array<'SUCCESSFUL' | 'FAILED' | 'NO_ANSWER' | 'VOICEMAIL'> = [
    'SUCCESSFUL',
    'SUCCESSFUL',
    'SUCCESSFUL',
    'FAILED',
    'NO_ANSWER',
    'VOICEMAIL',
  ]

  const customerNames = [
    'John Smith',
    'Emma Johnson',
    'Michael Brown',
    'Sophie Williams',
    'David Jones',
    'Olivia Taylor',
    'James Davies',
    'Isabella Wilson',
    'William Evans',
    'Amelia Thomas',
    'George Roberts',
    'Mia Robinson',
    'Harry Walker',
    'Ava White',
    'Jack Harris',
  ]

  const topics = [
    'Product inquiry',
    'Technical support',
    'Billing question',
    'Order status',
    'Complaint resolution',
    'Feature request',
    'Account setup',
    'Cancellation request',
    'Upgrade inquiry',
    'General information',
  ]

  // Create conversations for each organization
  const orgAgentMap = [
    { org: org1, agents: techCorpAgents, count: 20 },
    { org: org2, agents: healthPlusAgents, count: 50 }, // Default org gets more data
    { org: org3, agents: retailHubAgents, count: 15 },
  ]

  for (const { org, agents, count } of orgAgentMap) {
    for (let i = 0; i < count; i++) {
      const agent = agents[Math.floor(Math.random() * agents.length)]
      if (!agent) continue // Skip if no agent found

      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const isEnded = status === 'ENDED'
      const createdAt = randomDate(7)
      const startedAt = createdAt
      const endedAt = isEnded ? new Date(createdAt.getTime() + Math.floor(Math.random() * 600000) + 60000) : null

      const conversation = await prisma.conversation.create({
        data: {
          agentId: agent.id,
          organizationId: org.id,
          status,
          sentiment: isEnded ? sentiments[Math.floor(Math.random() * sentiments.length)] : null,
          duration: isEnded ? Math.floor(Math.random() * 600) + 60 : null, // 1-10 minutes
          outcome: isEnded ? outcomes[Math.floor(Math.random() * outcomes.length)] : null,
          customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
          customerPhone: `+4479${Math.floor(Math.random() * 100000000)
            .toString()
            .padStart(8, '0')}`,
          topic: topics[Math.floor(Math.random() * topics.length)],
          startedAt,
          endedAt,
          createdAt,
          updatedAt: createdAt,
        },
      })

      allConversations.push(conversation)
    }
  }

  console.log(`✅ Created ${allConversations.length} conversations (TechCorp: 20, HealthPlus: 50, RetailHub: 15)`)

  // Create activities based on conversations
  console.log('📊 Creating activities...')
  const allActivities = []

  for (const conversation of allConversations.slice(0, 50)) {
    // Create activity for first 50 conversations
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

  console.log(`✅ Created ${allActivities.length} activities`)

  // Create CRM integrations for each organization
  console.log('🔗 Creating CRM integrations...')
  await prisma.cRMIntegration.create({
    data: {
      organizationId: org1.id,
      provider: 'SALESFORCE',
      status: 'CONNECTED',
      lastSync: new Date(),
      contactsCount: 1250,
      dealsCount: 45,
    },
  })

  await prisma.cRMIntegration.create({
    data: {
      organizationId: org2.id,
      provider: 'HUBSPOT',
      status: 'DISCONNECTED',
      lastSync: null,
    },
  })

  await prisma.cRMIntegration.create({
    data: {
      organizationId: org3.id,
      provider: 'PIPEDRIVE',
      status: 'ERROR',
      lastSync: new Date(Date.now() - 86400000), // 1 day ago
      contactsCount: 320,
      dealsCount: 12,
    },
  })

  console.log('✅ Created 3 CRM integrations')

  // Print summary
  console.log('\n✅ Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   Organizations: ${organizations.length}`)
  console.log(`     - TechCorp UK (Enterprise)`)
  console.log(`     - HealthPlus Medical (Pro) - Default`)
  console.log(`     - RetailHub Commerce (Free)`)
  console.log(`   Users: 7`)
  console.log(`   Voice Agents: ${allAgents.length}`)
  console.log(`   Conversations: ${allConversations.length}`)
  console.log(`   Activities: ${allActivities.length}`)
  console.log(`   CRM Integrations: 3`)
  console.log('\n🎉 You can now view the dashboard with sample data!')
  console.log('   Run: npm run dev')
  console.log('   Open: http://localhost:3001')
  console.log('\n💡 Default organization: HealthPlus Medical Services (demo-org-id)')
  console.log('   Switch organizations using the organization switcher (coming next!)\n')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

