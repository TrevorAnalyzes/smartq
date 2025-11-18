/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const org = await prisma.organization.create({
      data: {
        name: 'Debug Org',
        domain: 'https://debug-org.local',
        plan: 'FREE',
      },
    })

    console.log('Created organization:', org)
  } catch (error) {
    console.error('Prisma error during organization create:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error('Unexpected error in debug script:', e)
  process.exit(1)
})
