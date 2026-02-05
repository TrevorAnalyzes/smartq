import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrganizationUpdateInput } from '@/lib/types'

// GET /api/organizations/[id] - Get single organization
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            voiceAgents: true,
            conversations: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Transform data to match frontend format
    const transformedOrganization = {
      id: organization.id,
      name: organization.name,
      domain: organization.domain,
      plan: organization.plan.toLowerCase(),
      defaultAccent: organization.defaultAccent.toLowerCase().replace(/_/g, '-'),
      crmProvider: organization.crmProvider?.toLowerCase(),
      emailAlerts: organization.emailAlerts,
      smsAlerts: organization.smsAlerts,
      webhookUrl: organization.webhookUrl,
      brandingPrimaryColor: organization.brandingPrimaryColor,
      brandingLogo: organization.brandingLogo,
      brandingCompanyName: organization.brandingCompanyName,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      _count: organization._count,
    }

    return NextResponse.json(transformedOrganization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 })
  }
}

// PATCH /api/organizations/[id] - Update organization
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    })

    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Build update data
    const updateData: OrganizationUpdateInput = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.domain !== undefined) updateData.domain = body.domain
    if (body.plan !== undefined) updateData.plan = body.plan.toUpperCase()
    if (body.defaultAccent !== undefined)
      updateData.defaultAccent = body.defaultAccent.toUpperCase().replace(/-/g, '_')
    if (body.crmProvider !== undefined)
      updateData.crmProvider = body.crmProvider ? body.crmProvider.toUpperCase() : null
    if (body.emailAlerts !== undefined) updateData.emailAlerts = body.emailAlerts
    if (body.smsAlerts !== undefined) updateData.smsAlerts = body.smsAlerts
    if (body.webhookUrl !== undefined) updateData.webhookUrl = body.webhookUrl
    if (body.brandingPrimaryColor !== undefined)
      updateData.brandingPrimaryColor = body.brandingPrimaryColor
    if (body.brandingLogo !== undefined) updateData.brandingLogo = body.brandingLogo
    if (body.brandingCompanyName !== undefined)
      updateData.brandingCompanyName = body.brandingCompanyName

    // Update organization
    const organization = await prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true,
            voiceAgents: true,
            conversations: true,
          },
        },
      },
    })

    // Transform data to match frontend format
    const transformedOrganization = {
      id: organization.id,
      name: organization.name,
      domain: organization.domain,
      plan: organization.plan.toLowerCase(),
      defaultAccent: organization.defaultAccent.toLowerCase().replace(/_/g, '-'),
      crmProvider: organization.crmProvider?.toLowerCase(),
      emailAlerts: organization.emailAlerts,
      smsAlerts: organization.smsAlerts,
      webhookUrl: organization.webhookUrl,
      brandingPrimaryColor: organization.brandingPrimaryColor,
      brandingLogo: organization.brandingLogo,
      brandingCompanyName: organization.brandingCompanyName,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      _count: organization._count,
    }

    return NextResponse.json(transformedOrganization)
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    })

    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Delete organization (cascade will delete all related data)
    await prisma.organization.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
  }
}
