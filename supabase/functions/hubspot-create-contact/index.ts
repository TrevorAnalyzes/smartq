// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/hubspot-create-contact/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async req => {
  // Load the HubSpot API key from Supabase secrets
  const HUBSPOT_API_KEY = Deno.env.get('HUBSPOT_API_KEY')
  if (!HUBSPOT_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing HUBSPOT_API_KEY in Supabase secrets' }), {
      status: 500,
    })
  }

  try {
    const body = await req.json()

    const { email, phone, firstName, lastName } = body

    if (!email && !phone) {
      return new Response(JSON.stringify({ error: 'Provide at least email or phone' }), {
        status: 400,
      })
    }

    // HubSpot contact creation/upsert endpoint
    const url = 'https://api.hubapi.com/crm/v3/objects/contacts'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          email: email || undefined,
          phone: phone || undefined,
          firstname: firstName || '',
          lastname: lastName || '',
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: 'HubSpot API error',
          details: data,
        }),
        { status: 500 }
      )
    }

    // Return the HubSpot contact ID
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hubspot-create-contact' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
