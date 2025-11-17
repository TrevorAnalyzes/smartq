// Twilio Voice Webhook Route
// POST /api/twilio/voice - Returns TwiML to start a Media Stream for the call

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { twilio } from '@/lib/twilio'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const url = request.nextUrl
    const organizationId = url.searchParams.get('organizationId')
    const conversationId = url.searchParams.get('conversationId')

    if (!organizationId || !conversationId) {
      return NextResponse.json(
        { error: 'Missing organizationId or conversationId' },
        { status: 400 },
      )
    }

    const authToken = process.env.TWILIO_AUTH_TOKEN
    const webhookBaseUrl = process.env.TWILIO_WEBHOOK_BASE_URL
    const signature = request.headers.get('x-twilio-signature')

    // Validate Twilio signature in production to ensure the request is coming from Twilio
    if (authToken && webhookBaseUrl && signature) {
      const formData = await request.formData()
      const params: Record<string, string> = {}

      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') params[key] = value
      }

      const expectedUrl = `${webhookBaseUrl}${url.pathname}${url.search}`
      const isValid = twilio.validateRequest(authToken, signature, expectedUrl, params)

      if (!isValid && process.env.NODE_ENV === 'production') {
        console.error('Invalid Twilio signature for voice webhook')
        return NextResponse.json({ error: 'Invalid Twilio signature' }, { status: 403 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('Twilio webhook environment variables are not fully configured')
      return NextResponse.json({ error: 'Twilio webhook not configured' }, { status: 500 })
    }

    // Ensure the conversation exists and belongs to the organization
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        organizationId,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const mediaStreamUrl = process.env.TWILIO_MEDIA_STREAM_URL

    if (!mediaStreamUrl) {
      return NextResponse.json(
        { error: 'Media stream URL not configured (TWILIO_MEDIA_STREAM_URL)' },
        { status: 500 },
      )
    }

    const streamUrl = `${mediaStreamUrl}?conversationId=${conversation.id}&organizationId=${organizationId}`

    // Build TwiML that starts a media stream to the separate telephony bridge service
    const response = new twilio.twiml.VoiceResponse()
    const start = response.start()

    start.stream({ url: streamUrl })

    // Optionally, you could also add a greeting here with response.say(...)

    return new NextResponse(response.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Twilio Voice Webhook Error:', error)
    return NextResponse.json({ error: 'Failed to generate TwiML' }, { status: 500 })
  }
}

