const telnyxApiKey = process.env.TELNYX_API_KEY
const telnyxBaseUrl = process.env.TELNYX_API_BASE_URL || 'https://api.telnyx.com/v2'

if (!telnyxApiKey && process.env.NODE_ENV !== 'production') {
  console.warn('Telnyx API key is missing. TELNYX_API_KEY must be set.')
}

type TelnyxRequestOptions = {
  method: string
  body?: unknown
}

async function telnyxRequest<T>(path: string, options: TelnyxRequestOptions): Promise<T> {
  if (!telnyxApiKey) {
    throw new Error('Telnyx API key is not configured')
  }

  const response = await fetch(`${telnyxBaseUrl}${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${telnyxApiKey}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Telnyx API error (${response.status}): ${errorText}`)
  }

  return (await response.json()) as T
}

export function encodeTelnyxClientState(payload: Record<string, string>) {
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export function decodeTelnyxClientState(clientState?: string) {
  if (!clientState) return null
  try {
    return JSON.parse(Buffer.from(clientState, 'base64').toString('utf-8')) as Record<
      string,
      string
    >
  } catch {
    return null
  }
}

export async function createTelnyxCall({
  to,
  from,
  connectionId,
  webhookEventUrl,
  clientState,
}: {
  to: string
  from: string
  connectionId: string
  webhookEventUrl: string
  clientState?: string
}) {
  return telnyxRequest<{ data: { call_control_id: string } }>('/calls', {
    method: 'POST',
    body: {
      to,
      from,
      connection_id: connectionId,
      webhook_event_url: webhookEventUrl,
      client_state: clientState,
    },
  })
}

export async function answerTelnyxCall(callControlId: string, clientState?: string) {
  return telnyxRequest(`/calls/${callControlId}/actions/answer`, {
    method: 'POST',
    body: clientState ? { client_state: clientState } : undefined,
  })
}

export async function startTelnyxStreaming({
  callControlId,
  streamUrl,
}: {
  callControlId: string
  streamUrl: string
}) {
  return telnyxRequest(`/calls/${callControlId}/actions/streaming_start`, {
    method: 'POST',
    body: {
      stream_url: streamUrl,
      stream_track: 'both',
    },
  })
}
