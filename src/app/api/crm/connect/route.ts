// CRM Connect API Route
// POST /api/crm/connect - Connect a CRM integration

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { CRMProviderFactory } from '@/lib/crm/provider-factory'
import { CRMProvider, CRMConfig } from '@/lib/crm/types'

export async function POST(request: NextRequest) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    const body = await request.json()
    const { provider, credentials, webhookUrl, customFields } = body

    if (!provider || !credentials) {
      return NextResponse.json({ error: 'Provider and credentials are required' }, { status: 400 })
    }

    // Validate provider
    if (!CRMProviderFactory.getSupportedProviders().includes(provider)) {
      return NextResponse.json({ error: 'Unsupported CRM provider' }, { status: 400 })
    }

    // Create CRM config
    const config: CRMConfig = {
      provider: provider as CRMProvider,
      authMethod: getAuthMethodForProvider(provider),
      credentials,
      webhookUrl,
      customFields
    }

    // Validate config
    const validation = CRMProviderFactory.validateConfig(config)
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Invalid configuration',
        details: validation.errors
      }, { status: 400 })
    }

    // Create provider instance and test connection
    const crmProvider = CRMProviderFactory.createProvider(config, organizationId)

    const isAuthenticated = await crmProvider.authenticate()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    const connectionTest = await crmProvider.testConnection()
    if (!connectionTest) {
      return NextResponse.json({ error: 'Connection test failed' }, { status: 400 })
    }

    // Store integration in database
    const integration = await prisma.cRMIntegration.upsert({
      where: {
        organizationId_provider: {
          organizationId,
          provider: provider as CRMProvider
        }
      },
      update: {
        status: 'CONNECTED',
        config: config as any,
        updatedAt: new Date()
      },
      create: {
        organizationId,
        provider: provider as CRMProvider,
        status: 'CONNECTED',
        config: config as any
      }
    })

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        provider: integration.provider,
        status: integration.status,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt
      }
    })

  } catch (error) {
    console.error('CRM connect error:', error)
    return NextResponse.json(
      { error: 'Failed to connect CRM integration' },
      { status: 500 }
    )
  }
}

function getAuthMethodForProvider(provider: string): 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH' {
  switch (provider) {
    case 'HUBSPOT':
      return 'API_KEY' // Can also be OAUTH2
    case 'PIPEDRIVE':
      return 'API_KEY'
    case 'SALESFORCE':
      return 'OAUTH2'
    case 'ZOHO':
      return 'OAUTH2'
    default:
      return 'API_KEY'
  }
}

