// Database Seed Script
// Run with: npm run db:seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Starting database cleanup...')

  // Clear existing data
  console.log('🗑️  Clearing all existing data...')
  await prisma.activity.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.voiceAgent.deleteMany()
  await prisma.user.deleteMany()
  await prisma.cRMIntegration.deleteMany()
  await prisma.organization.deleteMany()

  console.log('✅ Database cleared successfully!')
  console.log('\n📊 Summary:')
  console.log('   All organizations, users, agents, conversations, and activities have been removed.')
  console.log('   The database is now ready for real data.')
  console.log('\n🎉 You can now start using the system with real data!')
  console.log('   Run: npm run dev')
  console.log('   Open: http://localhost:3000')
  console.log('\n💡 Create your first organization and agents through the UI.')


}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

