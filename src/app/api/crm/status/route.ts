// CRM Status API Route
// GET /api/crm/status - Get CRM integration status

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Fetch all CRM integrations for the organization
    const crmIntegrations = await prisma.cRMIntegration.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match frontend expectations
    const integrations = crmIntegrations.map(integration => ({
      id: integration.id,
      provider: integration.provider,
      status: integration.status,
      lastSync: integration.lastSync?.toISOString(),
      lastSyncResult: integration.lastSyncResult,
      contactsCount: integration.contactsCount,
      dealsCount: integration.dealsCount,
      companiesCount: integration.companiesCount,
      createdAt: integration.createdAt.toISOString(),
      updatedAt: integration.updatedAt.toISOString(),
    }))

    return NextResponse.json(integrations)
  } catch (error) {
    console.error('Error fetching CRM status:', error)
    return NextResponse.json({ error: 'Failed to fetch CRM status' }, { status: 500 })
  }
}
