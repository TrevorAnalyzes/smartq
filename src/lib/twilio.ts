import twilio from 'twilio'

// Twilio client singleton for server-side usage only
// This is used by API routes that interact with Twilio's REST API.

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

if ((!accountSid || !authToken) && process.env.NODE_ENV !== 'production') {
  console.warn('Twilio credentials are missing. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set.')
}

export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null

// Re-export the Twilio library so API routes can access helpers like TwiML and validateRequest
export { twilio }

