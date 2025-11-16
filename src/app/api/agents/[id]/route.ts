// Single Voice Agent API Route
// GET /api/agents/[id] - Get a single agent
// PATCH /api/agents/[id] - Update an agent
// DELETE /api/agents/[id] - Delete an agent

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { voiceAgentSchema } from '@/lib/validations'
import { getOrganizationIdFromRequest } from '@/lib/tenant'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    let organizationId: string
    try {
      organizationId = getOrganizationIdFromRequest(request)
    } catch {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const agent = await prisma.voiceAgent.findUnique({
      where: { id },
      include: {
        _count: {
          select: { conversations: true },
        },
      },
    })

    if (!agent || agent.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Transform response
    const transformedAgent = {
      id: agent.id,
      name: agent.name,
      status: agent.status.toLowerCase(),
      accentType: agent.accentType.toLowerCase().replace(/_/g, '-'),
      phoneNumber: agent.phoneNumber,
      description: agent.description,
      totalCalls: agent._count.conversations,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }

    return NextResponse.json(transformedAgent)
  } catch (error) {
    console.error('Agent GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    let organizationId: string
    try {
      organizationId = getOrganizationIdFromRequest(request)
    } catch {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const existing = await prisma.voiceAgent.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Partial validation
    const validatedData = voiceAgentSchema.partial().parse(body)

    // Update agent
    const agent = await prisma.voiceAgent.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.accentType && {
          accentType: validatedData.accentType.toUpperCase().replace(/-/g, '_') as any,
        }),
        ...(validatedData.phoneNumber !== undefined && { phoneNumber: validatedData.phoneNumber }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
      },
    })

    // Transform response
    const transformedAgent = {
      id: agent.id,
      name: agent.name,
      status: agent.status.toLowerCase(),
      accentType: agent.accentType.toLowerCase().replace(/_/g, '-'),
      phoneNumber: agent.phoneNumber,
      description: agent.description,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }

    return NextResponse.json(transformedAgent)
  } catch (error) {
    console.error('Agent PATCH Error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    let organizationId: string
    try {
      organizationId = getOrganizationIdFromRequest(request)
    } catch {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const existing = await prisma.voiceAgent.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Delete agent (conversations will be cascade deleted)
    await prisma.voiceAgent.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Agent deleted successfully' })
  } catch (error) {
    console.error('Agent DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 })
  }
}

