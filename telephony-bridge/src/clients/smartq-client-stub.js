import { logger } from '../utils/logger.js'

/**
 * Stub implementation of SmartQ API client for testing
 */
export class SmartQApiClient {
  constructor() {
    logger.info('SmartQ client stub initialized')
  }

  async updateConversationStatus(conversationId, organizationId, status) {
    logger.info('SmartQ client stub - updateConversationStatus called', {
      conversationId,
      organizationId,
      status,
    })
    return Promise.resolve({ success: true })
  }

  async addTranscript(conversationId, organizationId, role, content) {
    logger.info('SmartQ client stub - addTranscript called', {
      conversationId,
      organizationId,
      role,
      contentLength: content.length,
    })
    return Promise.resolve({ success: true })
  }

  async getConversation(conversationId, organizationId) {
    logger.info('SmartQ client stub - getConversation called', {
      conversationId,
      organizationId,
    })
    return Promise.resolve({ id: conversationId, status: 'active' })
  }
}
