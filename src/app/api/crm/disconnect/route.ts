// CRM Disconnect API Route
// POST /api/crm/disconnect - Disconnect a CRM integration

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'

export async function POST(request: NextRequest) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { provider } = body

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    // Find the CRM integration
    const crmIntegration = await prisma.cRMIntegration.findUnique({
      where: {
        organizationId_provider: {
          organizationId,
          provider,
        },
      },
    })

    if (!crmIntegration) {
      return NextResponse.json({ error: 'CRM integration not found' }, { status: 404 })
    }

    // Delete the integration and all associated data
    await prisma.$transaction(async tx => {
      // Delete CRM data
      await tx.cRMContact.deleteMany({
        where: { organizationId, provider },
      })

      await tx.cRMDeal.deleteMany({
        where: { organizationId, provider },
      })

      await tx.cRMCompany.deleteMany({
        where: { organizationId, provider },
      })

      // Delete the integration
      await tx.cRMIntegration.delete({
        where: { id: crmIntegration.id },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'CRM disconnected successfully',
    })
  } catch (error) {
    console.error('CRM disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect CRM integration' }, { status: 500 })
  }
}
