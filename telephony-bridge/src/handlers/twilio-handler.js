import { logger } from '../utils/logger.js'
import { OpenAIRealtimeClient } from '../clients/openai-client-stub.js'
import { SmartQApiClient } from '../clients/smartq-client-stub.js'

/**
 * Handles Twilio Media Stream WebSocket connections
 * Bridges audio between Twilio and OpenAI Realtime API
 */
export class TwilioMediaStreamHandler {
  constructor(ws, req) {
    this.ws = ws
    this.req = req
    this.streamSid = null
    this.callSid = null
    this.conversationId = null
    this.organizationId = null

    // Parse query parameters from WebSocket URL
    this.parseConnectionParams()

    // Initialize clients
    this.openaiClient = null
    this.smartqClient = new SmartQApiClient()

    // Audio buffers
    this.audioBuffer = []
    this.isConnected = false

    logger.info('TwilioMediaStreamHandler initialized', {
      conversationId: this.conversationId,
      organizationId: this.organizationId,
    })
  }

  parseConnectionParams() {
    const url = new URL(this.req.url, 'http://localhost')
    this.conversationId = url.searchParams.get('conversationId')
    this.organizationId = url.searchParams.get('organizationId')

    if (!this.conversationId || !this.organizationId) {
      logger.warn('Missing required connection parameters', {
        conversationId: this.conversationId,
        organizationId: this.organizationId,
      })
    }
  }

  async handleMessage(message) {
    try {
      const data = JSON.parse(message.toString())

      switch (data.event) {
        case 'connected':
          await this.handleConnected(data)
          break
        case 'start':
          await this.handleStart(data)
          break
        case 'media':
          await this.handleMedia(data)
          break
        case 'stop':
          await this.handleStop(data)
          break
        default:
          logger.debug('Unknown Twilio event', { event: data.event })
      }
    } catch (error) {
      logger.error('Error handling Twilio message', {
        error: error.message,
        message: message.toString().substring(0, 200),
      })
    }
  }

  async handleConnected(data) {
    logger.info('Twilio Media Stream connected', data)
    this.isConnected = true
  }

  async handleStart(data) {
    this.streamSid = data.streamSid
    this.callSid = data.start?.callSid

    logger.info('Twilio Media Stream started', {
      streamSid: this.streamSid,
      callSid: this.callSid,
      conversationId: this.conversationId,
    })

    // Initialize OpenAI Realtime connection
    await this.initializeOpenAI()

    // Update conversation status in SmartQ
    if (this.conversationId) {
      await this.smartqClient.updateConversationStatus(
        this.conversationId,
        this.organizationId,
        'active'
      )
    }
  }

  async handleMedia(data) {
    if (!this.openaiClient) {
      logger.warn('Received media before OpenAI client initialized')
      return
    }

    // Convert Twilio audio (base64 μ-law) to OpenAI format
    const audioData = this.convertTwilioAudio(data.media.payload)

    // Send to OpenAI Realtime
    await this.openaiClient.sendAudio(audioData)
  }

  async handleStop(_data) {
    logger.info('Twilio Media Stream stopped', {
      streamSid: this.streamSid,
      callSid: this.callSid,
    })

    // Update conversation status
    if (this.conversationId) {
      await this.smartqClient.updateConversationStatus(
        this.conversationId,
        this.organizationId,
        'completed'
      )
    }

    await this.cleanup()
  }

  async initializeOpenAI() {
    try {
      this.openaiClient = new OpenAIRealtimeClient({
        conversationId: this.conversationId,
        organizationId: this.organizationId,
        onAudioResponse: audioData => this.sendAudioToTwilio(audioData),
        onTextResponse: text => this.handleTextResponse(text),
        onError: error => this.handleOpenAIError(error),
      })

      await this.openaiClient.connect()
      logger.info('OpenAI Realtime client connected')
    } catch (error) {
      logger.error('Failed to initialize OpenAI client', { error: error.message })
    }
  }

  convertTwilioAudio(base64Audio) {
    // Convert base64 μ-law to PCM format expected by OpenAI
    // This is a simplified conversion - production would need proper audio processing
    const buffer = Buffer.from(base64Audio, 'base64')
    return buffer
  }

  sendAudioToTwilio(audioData) {
    if (!this.isConnected || !this.streamSid) {
      return
    }

    // Convert OpenAI audio response to Twilio format
    const base64Audio = audioData.toString('base64')

    const message = {
      event: 'media',
      streamSid: this.streamSid,
      media: {
        payload: base64Audio,
      },
    }

    this.ws.send(JSON.stringify(message))
  }

  async handleTextResponse(text) {
    logger.info('OpenAI text response', { text, conversationId: this.conversationId })

    // Save transcript to SmartQ
    if (this.conversationId) {
      await this.smartqClient.addTranscript(
        this.conversationId,
        this.organizationId,
        'assistant',
        text
      )
    }
  }

  handleOpenAIError(error) {
    logger.error('OpenAI Realtime error', {
      error: error.message,
      conversationId: this.conversationId,
    })
  }

  async cleanup() {
    logger.info('Cleaning up TwilioMediaStreamHandler')

    if (this.openaiClient) {
      await this.openaiClient.disconnect()
      this.openaiClient = null
    }

    this.isConnected = false
    this.audioBuffer = []
  }
}
