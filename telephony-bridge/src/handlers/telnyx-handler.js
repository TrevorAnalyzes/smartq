import { logger } from '../utils/logger.js'
import { OpenAIRealtimeClient } from '../clients/openai-client-stub.js'
import { SmartQApiClient } from '../clients/smartq-client-stub.js'

/**
 * Handles Telnyx Media Stream WebSocket connections
 * Bridges audio between Telnyx and OpenAI Realtime API
 */
export class TelnyxMediaStreamHandler {
  constructor(ws, req) {
    this.ws = ws
    this.req = req
    this.streamId = null
    this.callControlId = null
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

    logger.info('TelnyxMediaStreamHandler initialized', {
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
          logger.debug('Unknown Telnyx event', { event: data.event })
      }
    } catch (error) {
      logger.error('Error handling Telnyx message', {
        error: error.message,
        message: message.toString().substring(0, 200),
      })
    }
  }

  async handleConnected(data) {
    logger.info('Telnyx Media Stream connected', data)
    this.isConnected = true
  }

  async handleStart(data) {
    this.streamId = data.stream_id || data.streamId
    this.callControlId = data.call_control_id || data.callControlId

    logger.info('Telnyx Media Stream started', {
      streamId: this.streamId,
      callControlId: this.callControlId,
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

    // Convert Telnyx audio (base64 mu-law) to OpenAI format
    const audioData = this.convertTelnyxAudio(data.media?.payload)

    // Send to OpenAI Realtime
    await this.openaiClient.sendAudio(audioData)
  }

  async handleStop(_data) {
    logger.info('Telnyx Media Stream stopped', {
      streamId: this.streamId,
      callControlId: this.callControlId,
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
        onAudioResponse: audioData => this.sendAudioToTelnyx(audioData),
        onTextResponse: text => this.handleTextResponse(text),
        onError: error => this.handleOpenAIError(error),
      })

      await this.openaiClient.connect()
      logger.info('OpenAI Realtime client connected')
    } catch (error) {
      logger.error('Failed to initialize OpenAI client', { error: error.message })
    }
  }

  convertTelnyxAudio(base64Audio) {
    if (!base64Audio) return Buffer.alloc(0)
    return Buffer.from(base64Audio, 'base64')
  }

  sendAudioToTelnyx(audioData) {
    if (!this.isConnected || !this.streamId) {
      return
    }

    // Convert OpenAI audio response to Telnyx format
    const base64Audio = audioData.toString('base64')

    const message = {
      event: 'media',
      stream_id: this.streamId,
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
    logger.info('Cleaning up TelnyxMediaStreamHandler')

    if (this.openaiClient) {
      await this.openaiClient.disconnect()
      this.openaiClient = null
    }

    this.isConnected = false
    this.audioBuffer = []
  }
}
