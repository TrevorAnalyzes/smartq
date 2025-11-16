'use strict'

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const DEMO_ORG_ID = 'demo-org-id'

async function main() {
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true },
  })

  console.log('Organizations found:', orgs)

  const idsToDelete = orgs
    .filter((org) => org.id !== DEMO_ORG_ID)
    .map((org) => org.id)

  if (!idsToDelete.length) {
    console.log('No other organizations to delete. Nothing to do.')
    return
  }

  console.log('Deleting all data for organizations:', idsToDelete)

  // Delete child records first, in case some foreign keys are not set to CASCADE
  await prisma.usageEvent.deleteMany({
    where: { organizationId: { in: idsToDelete } },
  })

  await prisma.activity.deleteMany({
    where: { organizationId: { in: idsToDelete } },
  })

  await prisma.conversation.deleteMany({
    where: { organizationId: { in: idsToDelete } },
  })

  await prisma.voiceAgent.deleteMany({
    where: { organizationId: { in: idsToDelete } },
  })

  await prisma.user.deleteMany({
    where: { organizationId: { in: idsToDelete } },
  })

  const orgDeleteResult = await prisma.organization.deleteMany({
    where: { id: { in: idsToDelete } },
  })

  console.log('Deleted organizations result:', orgDeleteResult)

  const remaining = await prisma.organization.findMany({
    select: { id: true, name: true },
  })

  console.log('Remaining organizations:', remaining)
}

main()
  .catch((err) => {
    console.error('Error cleaning up organizations:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

