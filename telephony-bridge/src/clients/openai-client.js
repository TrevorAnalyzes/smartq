import { WebSocket } from 'ws'
import { logger } from '../utils/logger.js'

/**
 * OpenAI Realtime API WebSocket client
 * Handles real-time audio conversation with OpenAI
 */
export class OpenAIRealtimeClient {
  constructor(options = {}) {
    this.conversationId = options.conversationId
    this.organizationId = options.organizationId
    this.onAudioResponse = options.onAudioResponse
    this.onTextResponse = options.onTextResponse
    this.onError = options.onError

    this.ws = null
    this.isConnected = false
    this.sessionId = null

    // OpenAI Realtime API configuration
    this.apiKey = process.env.OPENAI_API_KEY
    this.model = 'gpt-4o-realtime-preview-2024-10-01'
    this.voice = 'alloy'

    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
  }

  async connect() {
    try {
      const url = 'wss://api.openai.com/v1/realtime?model=' + this.model

      this.ws = new WebSocket(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      })

      this.ws.on('open', () => {
        logger.info('OpenAI Realtime WebSocket connected')
        this.isConnected = true
        this.initializeSession()
      })

      this.ws.on('message', data => {
        this.handleMessage(data)
      })

      this.ws.on('close', (code, reason) => {
        logger.info('OpenAI Realtime WebSocket closed', { code, reason: reason.toString() })
        this.isConnected = false
      })

      this.ws.on('error', error => {
        logger.error('OpenAI Realtime WebSocket error', { error: error.message })
        this.isConnected = false
        if (this.onError) {
          this.onError(error)
        }
      })

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('OpenAI connection timeout'))
        }, 10000)

        this.ws.on('open', () => {
          clearTimeout(timeout)
          resolve()
        })

        this.ws.on('error', error => {
          clearTimeout(timeout)
          reject(error)
        })
      })
    } catch (error) {
      logger.error('Failed to connect to OpenAI Realtime', { error: error.message })
      throw error
    }
  }

  initializeSession() {
    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: `You are a helpful AI voice assistant for SmartQ. 
                      You are having a phone conversation with a customer.
                      Be conversational, helpful, and concise.
                      Keep responses brief and natural for voice interaction.`,
        voice: this.voice,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 200,
        },
        tools: [],
        tool_choice: 'auto',
        temperature: 0.8,
        max_response_output_tokens: 4096,
      },
    }

    this.sendMessage(sessionConfig)
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data.toString())

      switch (message.type) {
        case 'session.created':
          this.sessionId = message.session.id
          logger.info('OpenAI session created', { sessionId: this.sessionId })
          break

        case 'response.audio.delta':
          if (this.onAudioResponse && message.delta) {
            const audioBuffer = Buffer.from(message.delta, 'base64')
            this.onAudioResponse(audioBuffer)
          }
          break

        case 'response.text.delta':
          if (this.onTextResponse && message.delta) {
            this.onTextResponse(message.delta)
          }
          break

        case 'conversation.item.input_audio_transcription.completed':
          if (message.transcript) {
            logger.info('User transcript', {
              transcript: message.transcript,
              conversationId: this.conversationId,
            })
          }
          break

        case 'error':
          logger.error('OpenAI Realtime error', { error: message.error })
          if (this.onError) {
            this.onError(new Error(message.error.message))
          }
          break

        default:
          logger.debug('OpenAI message', { type: message.type })
      }
    } catch (error) {
      logger.error('Error parsing OpenAI message', { error: error.message })
    }
  }

  async sendAudio(audioBuffer) {
    if (!this.isConnected || !this.ws) {
      logger.warn('Cannot send audio - not connected to OpenAI')
      return
    }

    const message = {
      type: 'input_audio_buffer.append',
      audio: audioBuffer.toString('base64'),
    }

    this.sendMessage(message)
  }

  sendMessage(message) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message))
    }
  }

  async disconnect() {
    if (this.ws) {
      this.isConnected = false
      this.ws.close()
      this.ws = null
    }
  }
}
