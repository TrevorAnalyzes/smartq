// Single Conversation API Route
// GET /api/conversations/[id] - Get a single conversation
// PATCH /api/conversations/[id] - Update a conversation
// DELETE /api/conversations/[id] - Delete a conversation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            accentType: true,
            phoneNumber: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

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

    return NextResponse.json(transformedConversation)
  } catch (error) {
    console.error('Conversation GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Build update data
    const updateData: any = {}

    if (body.status) updateData.status = body.status.toUpperCase()
    if (body.duration !== undefined) updateData.duration = body.duration
    if (body.transcript !== undefined) updateData.transcript = body.transcript
    if (body.sentiment) updateData.sentiment = body.sentiment.toUpperCase()
    if (body.outcome !== undefined) updateData.outcome = body.outcome
    if (body.topic !== undefined) updateData.topic = body.topic
    if (body.customerName !== undefined) updateData.customerName = body.customerName

    // If status is being set to ENDED, set endedAt
    if (body.status?.toUpperCase() === 'ENDED' && !body.endedAt) {
      updateData.endedAt = new Date()
    }

    // Update conversation
    const conversation = await prisma.conversation.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(transformedConversation)
  } catch (error) {
    console.error('Conversation PATCH Error:', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Delete conversation
    await prisma.conversation.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Conversation deleted successfully' })
  } catch (error) {
    console.error('Conversation DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}

