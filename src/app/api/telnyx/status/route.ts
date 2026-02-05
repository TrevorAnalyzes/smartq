// Telnyx Status Check Route
// GET /api/telnyx/status - Check if Telnyx is properly configured

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const apiKey = !!process.env.TELNYX_API_KEY
    const connectionId = !!process.env.TELNYX_CONNECTION_ID
    const fromNumber = !!process.env.TELNYX_FROM_NUMBER
    const webhookUrl = !!process.env.TELNYX_WEBHOOK_BASE_URL
    const mediaStreamUrl = !!process.env.TELNYX_MEDIA_STREAM_URL

    const configured = apiKey && connectionId && fromNumber && webhookUrl && mediaStreamUrl

    return NextResponse.json({
      configured,
      apiKey,
      connectionId,
      fromNumber,
      webhookUrl,
      mediaStreamUrl,
    })
  } catch (error) {
    console.error('Telnyx Status Check Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check Telnyx status',
        configured: false,
        apiKey: false,
        connectionId: false,
        fromNumber: false,
        webhookUrl: false,
        mediaStreamUrl: false,
      },
      { status: 500 }
    )
  }
}
