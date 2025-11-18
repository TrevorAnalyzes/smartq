/**
 * Test Twilio Call Initiation
 * Run this script to debug call initiation issues
 * Usage: npx tsx scripts/test-twilio-call.ts
 */

import 'dotenv/config'

async function testTwilioCall() {
  console.log('🔍 Testing Twilio Call Configuration\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Check Environment Variables
  console.log('1️⃣ Environment Variables Check:')
  const requiredEnvVars = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    TWILIO_WEBHOOK_BASE_URL: process.env.TWILIO_WEBHOOK_BASE_URL,
    TWILIO_MEDIA_STREAM_URL: process.env.TWILIO_MEDIA_STREAM_URL,
  }

  let allEnvVarsSet = true
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    const isSet = !!value
    console.log(`   ${isSet ? '✅' : '❌'} ${key}: ${isSet ? '✓ Set' : '✗ Missing'}`)
    if (!isSet) allEnvVarsSet = false
  }
  console.log('')

  if (!allEnvVarsSet) {
    console.log('❌ Missing required environment variables. Please check your .env file.\n')
    return
  }

  // 2. Test Twilio Client Initialization
  console.log('2️⃣ Twilio Client Initialization:')
  try {
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
    console.log('   ✅ Twilio client initialized successfully\n')

    // 3. Verify Twilio Account
    console.log('3️⃣ Verifying Twilio Account:')
    try {
      const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch()
      console.log(`   ✅ Account SID: ${account.sid}`)
      console.log(`   ✅ Account Status: ${account.status}`)
      console.log(`   ✅ Account Name: ${account.friendlyName}\n`)
    } catch (error: any) {
      console.log(`   ❌ Failed to verify account: ${error.message}\n`)
      return
    }

    // 4. Verify Phone Number
    console.log('4️⃣ Verifying Twilio Phone Number:')
    try {
      const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 20 })
      const myNumber = phoneNumbers.find(num => num.phoneNumber === process.env.TWILIO_PHONE_NUMBER)

      if (myNumber) {
        console.log(`   ✅ Phone Number: ${myNumber.phoneNumber}`)
        console.log(`   ✅ Friendly Name: ${myNumber.friendlyName}`)
        console.log(
          `   ✅ Capabilities: Voice=${myNumber.capabilities.voice}, SMS=${myNumber.capabilities.sms}\n`
        )
      } else {
        console.log(
          `   ⚠️  Phone number ${process.env.TWILIO_PHONE_NUMBER} not found in your account`
        )
        console.log(`   Available numbers:`)
        phoneNumbers.forEach(num => {
          console.log(`      - ${num.phoneNumber} (${num.friendlyName})`)
        })
        console.log('')
      }
    } catch (error: any) {
      console.log(`   ❌ Failed to verify phone number: ${error.message}\n`)
    }

    // 5. Test Call API Endpoint
    console.log('5️⃣ Testing Call API Endpoint:')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // First, get an agent ID
    try {
      const agentsResponse = await fetch(`${baseUrl}/api/agents?organizationId=org-techcorp-uk`)
      const agentsData = await agentsResponse.json()

      if (agentsData.agents && agentsData.agents.length > 0) {
        const testAgent = agentsData.agents[0]
        console.log(`   ✅ Found test agent: ${testAgent.name} (${testAgent.id})\n`)

        // Now test the call endpoint
        console.log('6️⃣ Simulating Test Call:')
        console.log('   📞 Attempting to initiate call...')

        const testPhoneNumber = '+447700900123' // UK test number
        console.log(`   📱 Test phone number: ${testPhoneNumber}`)
        console.log(`   🤖 Agent: ${testAgent.name}`)
        console.log(`   🏢 Organization: org-techcorp-uk\n`)

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
          console.log('   ✅ Call initiated successfully!')
          console.log(`   📞 Call SID: ${callData.callSid}`)
          console.log(`   💬 Conversation ID: ${callData.conversationId}\n`)
        } else {
          console.log(`   ❌ Call failed: ${callData.error}`)
          if (callData.details) {
            console.log(`   Details: ${JSON.stringify(callData.details, null, 2)}`)
          }
          console.log('')
        }
      } else {
        console.log('   ⚠️  No agents found. Please create an agent first.\n')
      }
    } catch (error: any) {
      console.log(`   ❌ API test failed: ${error.message}\n`)
    }
  } catch (error: any) {
    console.log(`   ❌ Failed to initialize Twilio client: ${error.message}\n`)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

testTwilioCall().catch(console.error)
