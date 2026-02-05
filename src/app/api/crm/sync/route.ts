// CRM Sync API Route
// POST /api/crm/sync - Trigger CRM data synchronization

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { CRMProviderFactory } from '@/lib/crm/provider-factory'
import { CRMConfig } from '@/lib/crm/types'

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getOrganizationIdFromRequest(request)
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

    if (crmIntegration.status !== 'CONNECTED') {
      return NextResponse.json({ error: 'CRM is not connected' }, { status: 400 })
    }

    // Update status to syncing
    await prisma.cRMIntegration.update({
      where: { id: crmIntegration.id },
      data: { status: 'SYNCING' },
    })

    try {
      // Create provider instance
      const config = crmIntegration.config as unknown as CRMConfig
      const crmProvider = CRMProviderFactory.createProvider(config, organizationId)

      // Test connection before syncing
      const connectionTest = await crmProvider.testConnection()
      if (!connectionTest) {
        await prisma.cRMIntegration.update({
          where: { id: crmIntegration.id },
          data: { status: 'ERROR' },
        })
        return NextResponse.json({ error: 'Connection test failed' }, { status: 400 })
      }

      // Perform full sync
      const syncResult = await crmProvider.fullSync()

      // Update integration with sync results
      const updatedIntegration = await prisma.cRMIntegration.update({
        where: { id: crmIntegration.id },
        data: {
          status: syncResult.success ? 'CONNECTED' : 'ERROR',
          lastSync: new Date(),
          lastSyncResult: syncResult as any,
          contactsCount: syncResult.contactsCount || 0,
          dealsCount: syncResult.dealsCount || 0,
          companiesCount: syncResult.companiesCount || 0,
        },
      })

      return NextResponse.json({
        success: true,
        message: syncResult.success
          ? 'CRM sync completed successfully'
          : 'CRM sync completed with errors',
        syncResult,
        integration: {
          id: updatedIntegration.id,
          provider: updatedIntegration.provider,
          status: updatedIntegration.status,
          lastSync: updatedIntegration.lastSync?.toISOString(),
          contactsCount: updatedIntegration.contactsCount,
          dealsCount: updatedIntegration.dealsCount,
          companiesCount: updatedIntegration.companiesCount,
        },
      })
    } catch (syncError) {
      // Update status to error
      await prisma.cRMIntegration.update({
        where: { id: crmIntegration.id },
        data: {
          status: 'ERROR',
          lastSyncResult: {
            success: false,
            error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
          },
        },
      })

      throw syncError
    }
  } catch (error) {
    console.error('CRM sync error:', error)
    return NextResponse.json({ error: 'Failed to sync CRM data' }, { status: 500 })
  }
}
