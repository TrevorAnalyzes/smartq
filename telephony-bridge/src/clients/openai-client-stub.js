import { logger } from '../utils/logger.js'

/**
 * Stub implementation of OpenAI Realtime client for testing
 */
export class OpenAIRealtimeClient {
  constructor(options = {}) {
    this.conversationId = options.conversationId
    this.organizationId = options.organizationId
    this.onAudioResponse = options.onAudioResponse
    this.onTextResponse = options.onTextResponse
    this.onError = options.onError

    logger.info('OpenAI client stub initialized')
  }

  async connect() {
    logger.info('OpenAI client stub - connect called')
    // Simulate connection
    return Promise.resolve()
  }

  async sendAudio(audioBuffer) {
    logger.debug('OpenAI client stub - sendAudio called', {
      bufferLength: audioBuffer.length,
    })
    // Simulate processing
  }

  async disconnect() {
    logger.info('OpenAI client stub - disconnect called')
    return Promise.resolve()
  }
}
