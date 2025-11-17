// Assistants API Route
// GET /api/agents - List all assistants
// POST /api/agents - Create a new assistant

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { voiceAgentSchema } from '@/lib/validations'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { VoiceAgentWhereInput, AccentType, AgentStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const organizationId = getOrganizationIdFromRequest(request)
    const status = searchParams.get('status')
    const accentType = searchParams.get('accentType')

    // Build where clause
    const where: VoiceAgentWhereInput = { organizationId }
    if (status) where.status = status.toUpperCase() as AgentStatus
    if (accentType) where.accentType = accentType.toUpperCase().replace(/-/g, '_') as AccentType

    // Fetch assistants with conversation count
    const agents = await prisma.voiceAgent.findMany({
      where,
      include: {
        _count: {
          select: { conversations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform data to match frontend expectations
    const transformedAgents = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      status: agent.status.toLowerCase(),
      accentType: agent.accentType.toLowerCase().replace(/_/g, '-'),
      phoneNumber: agent.phoneNumber,
      description: agent.description,
      totalCalls: agent._count.conversations,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }))

    return NextResponse.json(transformedAgents)
  } catch (error) {
    console.error('Agents GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const organizationId = getOrganizationIdFromRequest(request)

    // Validate request body
    const validatedData = voiceAgentSchema.parse(body)

    // Create new assistant
    const agent = await prisma.voiceAgent.create({
      data: {
        name: validatedData.name,
        accentType: validatedData.accentType.toUpperCase().replace(/-/g, '_') as AccentType,
        phoneNumber: validatedData.phoneNumber,
        description: validatedData.description,
        organizationId,
        status: 'INACTIVE', // New assistants start as inactive
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

    return NextResponse.json(transformedAgent, { status: 201 })
  } catch (error) {
    console.error('Agents POST Error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}

