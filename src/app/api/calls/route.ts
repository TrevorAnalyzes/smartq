// Calls API Route
// POST /api/calls - Initiate an outbound call via Twilio and create a conversation

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { callInitiationSchema } from '@/lib/validations'
import { twilioClient } from '@/lib/twilio'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    if (!twilioClient) {
      return NextResponse.json({ error: 'Twilio is not configured' }, { status: 500 })
    }

    const organizationId = getOrganizationIdFromRequest(request)
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

    const webhookBaseUrl = process.env.TWILIO_WEBHOOK_BASE_URL
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!webhookBaseUrl || !fromNumber) {
      return NextResponse.json(
        { error: 'Twilio webhook base URL or phone number not configured' },
        { status: 500 }
      )
    }

    // TwiML webhook that will control the call and start the media stream
    const twimlUrl = `${webhookBaseUrl}/api/twilio/voice?conversationId=${conversation.id}&organizationId=${organizationId}`

    const call = await twilioClient.calls.create({
      from: fromNumber,
      to: validated.customerPhone,
      url: twimlUrl,
    })

    return NextResponse.json(
      {
        conversationId: conversation.id,
        callSid: call.sid,
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
