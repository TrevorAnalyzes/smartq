// Conversations API Route
// GET /api/conversations - List all conversations with filters
// POST /api/conversations - Create a new conversation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { conversationSchema } from '@/lib/validations'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { ConversationWhereInput, ConversationStatus, Sentiment } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const organizationId = getOrganizationIdFromRequest(request)
    const status = searchParams.get('status')
    const agentId = searchParams.get('agentId')
    const sentiment = searchParams.get('sentiment')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🔍 Fetching conversations for organizationId:', organizationId)

    // Build where clause
    const where: ConversationWhereInput = { organizationId }
    if (status) where.status = status.toUpperCase() as ConversationStatus
    if (agentId) where.agentId = agentId
    if (sentiment) where.sentiment = sentiment.toUpperCase() as Sentiment

    console.log('🔍 Where clause:', JSON.stringify(where))

    // Fetch conversations with agent details
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            accentType: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
    })

    console.log('✅ Found conversations:', conversations.length)

    // Get total count for pagination
    const totalCount = await prisma.conversation.count({ where })

    // Transform data to match frontend expectations
    const transformedConversations = conversations.map((conv) => ({
      id: conv.id,
      agentId: conv.agentId,
      agentName: conv.agent.name,
      customerPhone: conv.customerPhone,
      customerName: conv.customerName,
      status: conv.status.toLowerCase(),
      duration: conv.duration,
      transcript: conv.transcript,
      sentiment: conv.sentiment?.toLowerCase(),
      outcome: conv.outcome,
      topic: conv.topic,
      startedAt: conv.startedAt,
      endedAt: conv.endedAt,
    }))

    return NextResponse.json({
      conversations: transformedConversations,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error('❌ Conversations GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const organizationId = getOrganizationIdFromRequest(request)

    // Validate request body
    const validatedData = conversationSchema.parse(body)

    // Ensure agentId is provided
    if (!body.agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
    }

    // Verify agent exists and belongs to organization
    const agent = await prisma.voiceAgent.findFirst({
      where: {
        id: body.agentId,
        organizationId,
      },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        agentId: body.agentId,
        organizationId,
        customerPhone: validatedData.customerPhone,
        customerName: validatedData.customerName,
        outcome: validatedData.outcome,
        status: 'RINGING', // New conversations start as ringing
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            accentType: true,
          },
        },
      },
    })

    // Transform response
    const transformedConversation = {
      id: conversation.id,
      agentId: conversation.agentId,
      agentName: conversation.agent.name,
      customerPhone: conversation.customerPhone,
      customerName: conversation.customerName,
      status: conversation.status.toLowerCase(),
      duration: conversation.duration,
      transcript: conversation.transcript,
      sentiment: conversation.sentiment?.toLowerCase(),
      outcome: conversation.outcome,
      topic: conversation.topic,
      startedAt: conversation.startedAt,
      endedAt: conversation.endedAt,
    }

    return NextResponse.json(transformedConversation, { status: 201 })
  } catch (error) {
    console.error('Conversations POST Error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

