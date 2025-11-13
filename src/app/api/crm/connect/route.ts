import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, provider, apiKey } = body

    if (!organizationId || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'Organization ID, provider, and API key are required' },
        { status: 400 }
      )
    }

    // Validate provider
    const validProviders = ['HUBSPOT', 'SALESFORCE', 'PIPEDRIVE']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid CRM provider' },
        { status: 400 }
      )
    }

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // TODO: In production, validate the API key with the actual CRM provider
    // For now, we'll just store it and mark as connected

    // Create or update CRM integration
    const crmIntegration = await prisma.cRMIntegration.upsert({
      where: { organizationId },
      create: {
        organizationId,
        provider,
        apiKey,
        status: 'CONNECTED',
        contactsCount: 0,
        dealsCount: 0,
      },
      update: {
        provider,
        apiKey,
        status: 'CONNECTED',
      },
    })

    // Also update the organization's crmProvider field
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        crmProvider: provider,
        crmApiKey: apiKey,
      },
    })

    return NextResponse.json({
      success: true,
      integration: {
        id: crmIntegration.id,
        provider: crmIntegration.provider,
        status: crmIntegration.status,
      },
    })
  } catch (error) {
    console.error('Error connecting CRM:', error)
    return NextResponse.json(
      { error: 'Failed to connect CRM' },
      { status: 500 }
    )
  }
}

