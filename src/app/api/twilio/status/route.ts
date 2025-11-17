// Twilio Status Check Route
// GET /api/twilio/status - Check if Twilio is properly configured

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const accountSid = !!process.env.TWILIO_ACCOUNT_SID
    const authToken = !!process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = !!process.env.TWILIO_PHONE_NUMBER
    const webhookUrl = !!process.env.TWILIO_WEBHOOK_BASE_URL
    const mediaStreamUrl = !!process.env.TWILIO_MEDIA_STREAM_URL

    const configured = accountSid && authToken && phoneNumber && webhookUrl && mediaStreamUrl

    return NextResponse.json({
      configured,
      accountSid,
      authToken,
      phoneNumber,
      webhookUrl,
      mediaStreamUrl,
    })
  } catch (error) {
    console.error('Twilio Status Check Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check Twilio status',
        configured: false,
        accountSid: false,
        authToken: false,
        phoneNumber: false,
        webhookUrl: false,
        mediaStreamUrl: false,
      }, 
      { status: 500 }
    )
  }
}
