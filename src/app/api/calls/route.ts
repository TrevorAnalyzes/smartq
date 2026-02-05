// Calls API Route
// POST /api/calls - Initiate an outbound call via Telnyx and create a conversation

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { callInitiationSchema } from '@/lib/validations'
import { createTelnyxCall, encodeTelnyxClientState } from '@/lib/telnyx'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.TELNYX_API_KEY
    const connectionId = process.env.TELNYX_CONNECTION_ID
    const fromNumber = process.env.TELNYX_FROM_NUMBER
    const webhookBaseUrl = process.env.TELNYX_WEBHOOK_BASE_URL

    if (!apiKey || !connectionId || !fromNumber || !webhookBaseUrl) {
      return NextResponse.json({ error: 'Telnyx is not configured' }, { status: 500 })
    }

    const organizationId = await getOrganizationIdFromRequest(request)
    const body = await request.json()

    const validated = callInitiationSchema.parse(body)

    // Ensure agent exists and belongs to the organization
    const agent = await prisma.voiceAgent.findFirst({
      where: {
        id: validated.agentId,
        organizationId,
      },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Create a new conversation record for this call
    const conversation = await prisma.conversation.create({
      data: {
        agentId: agent.id,
        organizationId,
        customerPhone: validated.customerPhone,
        customerName: validated.customerName,
        status: 'RINGING',
      },
    })

    const webhookEventUrl = `${webhookBaseUrl}/api/telnyx/events?conversationId=${conversation.id}&organizationId=${organizationId}`
    const clientState = encodeTelnyxClientState({
      conversationId: conversation.id,
      organizationId,
    })

    const call = await createTelnyxCall({
      from: fromNumber,
      to: validated.customerPhone,
      connectionId,
      webhookEventUrl,
      clientState,
    })

    return NextResponse.json(
      {
        conversationId: conversation.id,
        callControlId: call.data?.call_control_id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Calls POST Error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 })
  }
}
