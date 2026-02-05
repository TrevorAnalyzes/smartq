import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhookUrl, organizationId } = body

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 })
    }

    // Create a test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      organizationId: organizationId || 'test-org',
      data: {
        message: 'This is a test webhook from SmartQ AI Voice Agent',
        test: true,
      },
    }

    // Send the test webhook
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmartQ-Webhook/1.0',
        },
        body: JSON.stringify(testPayload),
      })

      if (!response.ok) {
        return NextResponse.json(
          {
            error: 'Webhook endpoint returned an error',
            status: response.status,
            statusText: response.statusText,
          },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Test webhook sent successfully',
        payload: testPayload,
      })
    } catch (fetchError) {
      console.error('Error sending webhook:', fetchError)
      return NextResponse.json(
        { error: 'Failed to send webhook. Please check the URL and try again.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json({ error: 'Failed to test webhook' }, { status: 500 })
  }
}
