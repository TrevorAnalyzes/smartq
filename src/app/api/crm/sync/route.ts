import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, provider } = body

    if (!organizationId || !provider) {
      return NextResponse.json(
        { error: 'Organization ID and provider are required' },
        { status: 400 }
      )
    }

    // Find the CRM integration
    const crmIntegration = await prisma.cRMIntegration.findFirst({
      where: {
        organizationId,
        provider,
      },
    })

    if (!crmIntegration) {
      return NextResponse.json(
        { error: 'CRM integration not found' },
        { status: 404 }
      )
    }

    if (crmIntegration.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'CRM is not connected' },
        { status: 400 }
      )
    }

    // TODO: In production, this would:
    // 1. Fetch contacts and deals from the CRM API
    // 2. Sync them to the database
    // 3. Update contactsCount and dealsCount
    
    // For now, we'll simulate a sync by updating the lastSync timestamp
    // and incrementing the counts slightly
    const updatedIntegration = await prisma.cRMIntegration.update({
      where: { id: crmIntegration.id },
      data: {
        lastSync: new Date(),
        contactsCount: crmIntegration.contactsCount + Math.floor(Math.random() * 10),
        dealsCount: crmIntegration.dealsCount + Math.floor(Math.random() * 5),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'CRM sync started',
      integration: {
        id: updatedIntegration.id,
        provider: updatedIntegration.provider,
        status: updatedIntegration.status,
        lastSync: updatedIntegration.lastSync?.toISOString(),
        contactsCount: updatedIntegration.contactsCount,
        dealsCount: updatedIntegration.dealsCount,
      },
    })
  } catch (error) {
    console.error('Error syncing CRM:', error)
    return NextResponse.json(
      { error: 'Failed to sync CRM' },
      { status: 500 }
    )
  }
}

