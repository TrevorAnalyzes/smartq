export async function POST(req: Request) {
  const { to } = await req.json()

  if (!to) {
    return Response.json({ error: '`to` is required' }, { status: 400 })
  }

  const resp = await fetch('https://api.telnyx.com/v2/calls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    body: JSON.stringify({
      connection_id: process.env.TELNYX_CONNECTION_ID,
      from: process.env.TELNYX_FROM_NUMBER,
      to,
      webhook_url: `${process.env.TELNYX_WEBHOOK_BASE_URL}/api/telnyx/webhook`,
      webhook_url_method: 'POST',
    }),
  })

  const data = await resp.json()
  return Response.json(data, { status: resp.status })
}
