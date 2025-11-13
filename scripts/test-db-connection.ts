// Test Database Connection Script
import { prisma } from '../src/lib/prisma'

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n')

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    await prisma.$connect()
    console.log('   ✅ Database connected successfully\n')

    // Test 2: Count organizations
    console.log('2️⃣ Testing Organizations table...')
    const orgCount = await prisma.organization.count()
    console.log(`   ✅ Found ${orgCount} organizations\n`)

    // Test 3: Fetch organizations with details
    console.log('3️⃣ Fetching organization details...')
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        _count: {
          select: {
            users: true,
            voiceAgents: true,
            conversations: true,
          },
        },
      },
    })
    
    orgs.forEach((org) => {
      console.log(`   📊 ${org.name} (${org.plan}):`)
      console.log(`      - Users: ${org._count.users}`)
      console.log(`      - Voice Agents: ${org._count.voiceAgents}`)
      console.log(`      - Conversations: ${org._count.conversations}`)
    })
    console.log('')

    // Test 4: Test conversations for TechCorp UK
    console.log('4️⃣ Testing TechCorp UK conversations...')
    const techCorpConvs = await prisma.conversation.findMany({
      where: { organizationId: 'org-techcorp-uk' },
      take: 5,
      select: {
        id: true,
        customerName: true,
        status: true,
        sentiment: true,
        startedAt: true,
      },
    })
    console.log(`   ✅ Found ${techCorpConvs.length} conversations (showing first 5)`)
    techCorpConvs.forEach((conv) => {
      console.log(`      - ${conv.customerName}: ${conv.status} (${conv.sentiment || 'N/A'})`)
    })
    console.log('')

    // Test 5: Test conversations for HealthPlus
    console.log('5️⃣ Testing HealthPlus Medical Services conversations...')
    const healthPlusConvs = await prisma.conversation.findMany({
      where: { organizationId: 'demo-org-id' },
      take: 5,
      select: {
        id: true,
        customerName: true,
        status: true,
        sentiment: true,
        startedAt: true,
      },
    })
    console.log(`   ✅ Found ${healthPlusConvs.length} conversations (showing first 5)`)
    healthPlusConvs.forEach((conv) => {
      console.log(`      - ${conv.customerName}: ${conv.status} (${conv.sentiment || 'N/A'})`)
    })
    console.log('')

    // Test 6: Test voice agents
    console.log('6️⃣ Testing Voice Agents...')
    const agentCount = await prisma.voiceAgent.count()
    console.log(`   ✅ Found ${agentCount} voice agents\n`)

    // Test 7: Test users
    console.log('7️⃣ Testing Users...')
    const userCount = await prisma.user.count()
    console.log(`   ✅ Found ${userCount} users\n`)

    console.log('🎉 All database tests passed successfully!\n')
  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()

