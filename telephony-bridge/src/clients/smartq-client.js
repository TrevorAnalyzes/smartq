import { logger } from '../utils/logger.js'

/**
 * Client for communicating with SmartQ API
 * Handles conversation updates and transcript storage
 */
export class SmartQApiClient {
  constructor() {
    this.baseUrl = process.env.SMARTQ_API_BASE_URL || 'http://localhost:3000'
    this.apiSecret = process.env.SMARTQ_API_SECRET

    if (!this.apiSecret) {
      logger.warn('SMARTQ_API_SECRET not configured - SmartQ integration disabled')
    }
  }

  async updateConversationStatus(conversationId, organizationId, status) {
    if (!this.apiSecret) {
      logger.debug('Skipping conversation status update - no API secret')
      return
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiSecret}`,
          'X-Organization-ID': organizationId,
        },
        body: JSON.stringify({
          status: status.toUpperCase(),
          updatedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      logger.info('Conversation status updated', {
        conversationId,
        status,
        organizationId,
      })

      return result
    } catch (error) {
      logger.error('Failed to update conversation status', {
        error: error.message,
        conversationId,
        status,
        organizationId,
      })
    }
  }

  async addTranscript(conversationId, organizationId, role, content) {
    if (!this.apiSecret) {
      logger.debug('Skipping transcript save - no API secret')
      return
    }

    try {
      // For now, we'll update the conversation with transcript data
      // In a full implementation, you might have a separate transcripts table
      const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiSecret}`,
          'X-Organization-ID': organizationId,
        },
        body: JSON.stringify({
          // Add transcript to conversation notes or create a transcript field
          notes: `${role}: ${content}`,
          updatedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      logger.info('Transcript added', {
        conversationId,
        role,
        contentLength: content.length,
        organizationId,
      })
    } catch (error) {
      logger.error('Failed to add transcript', {
        error: error.message,
        conversationId,
        role,
        organizationId,
      })
    }
  }

  async getConversation(conversationId, organizationId) {
    if (!this.apiSecret) {
      logger.debug('Skipping conversation fetch - no API secret')
      return null
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/conversations/${conversationId}?organizationId=${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiSecret}`,
            'X-Organization-ID': organizationId,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      logger.error('Failed to get conversation', {
        error: error.message,
        conversationId,
        organizationId,
      })
      return null
    }
  }
}
