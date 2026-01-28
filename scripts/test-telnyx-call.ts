/**
 * Test Telnyx Call Initiation
 * Run this script to debug call initiation issues
 * Usage: npx tsx scripts/test-telnyx-call.ts
 */

import 'dotenv/config'

async function testTelnyxCall() {
  console.log('Testing Telnyx Call Configuration\n')
  console.log('---------------------------------\n')

  // 1. Check Environment Variables
  console.log('1) Environment Variables Check:')
  const requiredEnvVars = {
    TELNYX_API_KEY: process.env.TELNYX_API_KEY,
    TELNYX_CONNECTION_ID: process.env.TELNYX_CONNECTION_ID,
    TELNYX_FROM_NUMBER: process.env.TELNYX_FROM_NUMBER,
    TELNYX_WEBHOOK_BASE_URL: process.env.TELNYX_WEBHOOK_BASE_URL,
    TELNYX_MEDIA_STREAM_URL: process.env.TELNYX_MEDIA_STREAM_URL,
  }

  let allEnvVarsSet = true
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    const isSet = !!value
    console.log(`   ${isSet ? 'OK' : 'MISSING'} ${key}`)
    if (!isSet) allEnvVarsSet = false
  }
  console.log('')

  if (!allEnvVarsSet) {
    console.log('Missing required environment variables. Please check your .env file.\n')
    return
  }

  // 2. Test Call API Endpoint
  console.log('2) Testing Call API Endpoint:')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const agentsResponse = await fetch(`${baseUrl}/api/agents?organizationId=org-techcorp-uk`)
    const agentsData = await agentsResponse.json()

    if (agentsData.agents && agentsData.agents.length > 0) {
      const testAgent = agentsData.agents[0]
      console.log(`   Found test agent: ${testAgent.name} (${testAgent.id})\n`)

      console.log('3) Simulating Test Call:')
      console.log('   Attempting to initiate call...')

      const testPhoneNumber = '+447700900123' // UK test number
      console.log(`   Test phone number: ${testPhoneNumber}`)
      console.log(`   Agent: ${testAgent.name}`)
      console.log('   Organization: org-techcorp-uk\n')

      const callResponse = await fetch(`${baseUrl}/api/calls?organizationId=org-techcorp-uk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: testAgent.id,
          customerPhone: testPhoneNumber,
          customerName: 'Test User',
        }),
      })

      const callData = await callResponse.json()

      if (callResponse.ok) {
        console.log('   Call initiated successfully!')
        console.log(`   Call Control ID: ${callData.callControlId}`)
        console.log(`   Conversation ID: ${callData.conversationId}\n`)
      } else {
        console.log(`   Call failed: ${callData.error}`)
        if (callData.details) {
          console.log(`   Details: ${JSON.stringify(callData.details, null, 2)}`)
        }
        console.log('')
      }
    } else {
      console.log('   No agents found. Please create an agent first.\n')
    }
  } catch (error: any) {
    console.log(`   API test failed: ${error.message}\n`)
  }

  console.log('---------------------------------\n')
}

testTelnyxCall().catch(console.error)
