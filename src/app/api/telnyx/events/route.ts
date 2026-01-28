// Telnyx Call Control Webhook Route
// POST /api/telnyx/events - Handles inbound/outbound call events and starts media streaming

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import {
  answerTelnyxCall,
  decodeTelnyxClientState,
  encodeTelnyxClientState,
  startTelnyxStreaming,
} from '@/lib/telnyx'

export const runtime = 'nodejs'

type TelnyxEventPayload = {
  call_control_id?: string
  client_state?: string
  direction?: string
  call_direction?: string
  from?: { phone_number?: string } | string
  to?: { phone_number?: string } | string
}

function extractPhone(value: TelnyxEventPayload['from'] | TelnyxEventPayload['to']) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'phone_number' in value) {
    return value.phone_number || null
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()
    const eventType = event?.data?.event_type as string | undefined
    const payload = (event?.data?.payload || {}) as TelnyxEventPayload

    const callControlId = payload.call_control_id
    const clientState = decodeTelnyxClientState(payload.client_state)
    const url = request.nextUrl

    let conversationId = clientState?.conversationId ?? url.searchParams.get('conversationId')
    let organizationId = clientState?.organizationId ?? url.searchParams.get('organizationId')

    if (!callControlId) {
      return NextResponse.json({ error: 'Missing call_control_id' }, { status: 400 })
    }

    switch (eventType) {
      case 'call.initiated': {
        const direction = payload.direction || payload.call_direction

        if (direction === 'incoming') {
          if (!conversationId || !organizationId) {
            const toNumber = extractPhone(payload.to)
            const fromNumber = extractPhone(payload.from) || 'unknown'

            const agent = await prisma.voiceAgent.findFirst({
              where: { phoneNumber: toNumber || undefined },
            })

            if (!agent) {
              console.error('Inbound call received for unknown number', { toNumber })
              return NextResponse.json({ error: 'No agent configured for inbound number' })
            }

            organizationId = agent.organizationId

            const conversation = await prisma.conversation.create({
              data: {
                agentId: agent.id,
                organizationId,
                customerPhone: fromNumber,
                status: 'RINGING',
              },
            })

            conversationId = conversation.id
          }

          const updatedClientState = encodeTelnyxClientState({
            conversationId,
            organizationId,
          })

          await answerTelnyxCall(callControlId, updatedClientState)
        }

        break
      }
      case 'call.answered': {
        const mediaStreamUrl = process.env.TELNYX_MEDIA_STREAM_URL

        if (!mediaStreamUrl || !conversationId || !organizationId) {
          console.error('Missing Telnyx media stream configuration or conversation metadata', {
            mediaStreamUrl,
            conversationId,
            organizationId,
          })
          break
        }

        const streamUrl = `${mediaStreamUrl}?conversationId=${conversationId}&organizationId=${organizationId}`

        await startTelnyxStreaming({
          callControlId,
          streamUrl,
        })
        break
      }
      case 'call.hangup': {
        if (conversationId && organizationId) {
          await prisma.conversation.updateMany({
            where: {
              id: conversationId,
              organizationId,
            },
            data: {
              status: 'ENDED',
              endedAt: new Date(),
            },
          })
        }
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Telnyx event webhook error:', error)
    return NextResponse.json({ error: 'Failed to process Telnyx event' }, { status: 500 })
  }
}
