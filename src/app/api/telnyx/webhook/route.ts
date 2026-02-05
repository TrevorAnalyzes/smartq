export async function POST(req: Request) {
  const payload = await req.json()

  // Confirm events are arriving (check Vercel logs)
  console.log('TELNYX_WEBHOOK_EVENT', payload?.data?.event_type)

  const eventType = payload?.data?.event_type

  // Minimal inbound flow: answer the call when initiated
  if (eventType === 'call.initiated') {
    return Response.json({
      data: [{ action: 'answer' }],
    })
  }

  // Default: no action
  return Response.json({ data: [] })
}
