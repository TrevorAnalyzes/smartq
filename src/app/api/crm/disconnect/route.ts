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

    // Update CRM integration status to DISCONNECTED
    await prisma.cRMIntegration.updateMany({
      where: {
        organizationId,
        provider,
      },
      data: {
        status: 'DISCONNECTED',
        apiKey: null,
      },
    })

    // Also update the organization's crmProvider field
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        crmProvider: null,
        crmApiKey: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'CRM disconnected successfully',
    })
  } catch (error) {
    console.error('Error disconnecting CRM:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect CRM' },
      { status: 500 }
    )
  }
}

