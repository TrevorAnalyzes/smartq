// Base CRM Provider Abstract Class

import { 
  CRMConfig, 
  CRMContact, 
  CRMDeal, 
  CRMCompany, 
  SyncResult, 
  CRMApiResponse,
  WebhookEvent 
} from './types'

export abstract class BaseCRMProvider {
  protected config: CRMConfig
  protected organizationId: string

  constructor(config: CRMConfig, organizationId: string) {
    this.config = config
    this.organizationId = organizationId
  }

  // Abstract methods that each provider must implement
  abstract testConnection(): Promise<boolean>
  abstract authenticate(): Promise<boolean>
  abstract refreshToken?(): Promise<boolean>

  // Contact operations
  abstract getContacts(cursor?: string, limit?: number): Promise<CRMApiResponse<CRMContact[]>>
  abstract getContact(id: string): Promise<CRMApiResponse<CRMContact>>
  abstract createContact(contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>>
  abstract updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>>
  abstract deleteContact(id: string): Promise<CRMApiResponse<void>>

  // Deal operations
  abstract getDeals(cursor?: string, limit?: number): Promise<CRMApiResponse<CRMDeal[]>>
  abstract getDeal(id: string): Promise<CRMApiResponse<CRMDeal>>
  abstract createDeal(deal: Partial<CRMDeal>): Promise<CRMApiResponse<CRMDeal>>
  abstract updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMApiResponse<CRMDeal>>
  abstract deleteDeal(id: string): Promise<CRMApiResponse<void>>

  // Company operations
  abstract getCompanies(cursor?: string, limit?: number): Promise<CRMApiResponse<CRMCompany[]>>
  abstract getCompany(id: string): Promise<CRMApiResponse<CRMCompany>>
  abstract createCompany(company: Partial<CRMCompany>): Promise<CRMApiResponse<CRMCompany>>
  abstract updateCompany(id: string, company: Partial<CRMCompany>): Promise<CRMApiResponse<CRMCompany>>
  abstract deleteCompany(id: string): Promise<CRMApiResponse<void>>

  // Webhook operations
  abstract setupWebhook(webhookUrl: string): Promise<CRMApiResponse<{ webhookId: string }>>
  abstract removeWebhook(webhookId: string): Promise<CRMApiResponse<void>>
  abstract validateWebhook(payload: any, signature: string): boolean
  abstract parseWebhookEvent(payload: any): WebhookEvent | null

  // Sync operations
  async fullSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      contactsCount: 0,
      dealsCount: 0,
      companiesCount: 0,
      errors: [],
      lastSyncAt: new Date()
    }

    try {
      // Test connection first
      const isConnected = await this.testConnection()
      if (!isConnected) {
        result.errors.push('Connection test failed')
        return result
      }

      // Sync contacts
      const contactsResult = await this.syncContacts()
      result.contactsCount = contactsResult.count
      result.errors.push(...contactsResult.errors)

      // Sync deals
      const dealsResult = await this.syncDeals()
      result.dealsCount = dealsResult.count
      result.errors.push(...dealsResult.errors)

      // Sync companies
      const companiesResult = await this.syncCompanies()
      result.companiesCount = companiesResult.count
      result.errors.push(...companiesResult.errors)

      result.success = result.errors.length === 0
      return result

    } catch (error) {
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  // Helper methods for syncing
  protected async syncContacts(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = []
    let count = 0
    let cursor: string | undefined
    let hasMore = true

    try {
      do {
        const response = await this.getContacts(cursor, 100)
        if (!response.success || !response.data) {
          errors.push(`Failed to fetch contacts: ${response.error}`)
          break
        }

        // Store contacts in database
        for (const contact of response.data) {
          try {
            await this.storeContact(contact)
            count++
          } catch (error) {
            errors.push(`Failed to store contact ${contact.id}: ${error}`)
          }
        }

        cursor = response.pagination?.nextCursor
        hasMore = response.pagination?.hasMore || false
      } while (cursor && hasMore)

    } catch (error) {
      errors.push(`Contact sync error: ${error}`)
    }

    return { count, errors }
  }

  protected async syncDeals(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = []
    let count = 0
    let cursor: string | undefined
    let hasMore = true

    try {
      do {
        const response = await this.getDeals(cursor, 100)
        if (!response.success || !response.data) {
          errors.push(`Failed to fetch deals: ${response.error}`)
          break
        }

        // Store deals in database
        for (const deal of response.data) {
          try {
            await this.storeDeal(deal)
            count++
          } catch (error) {
            errors.push(`Failed to store deal ${deal.id}: ${error}`)
          }
        }

        cursor = response.pagination?.nextCursor
        hasMore = response.pagination?.hasMore || false
      } while (cursor && hasMore)

    } catch (error) {
      errors.push(`Deal sync error: ${error}`)
    }

    return { count, errors }
  }

  protected async syncCompanies(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = []
    let count = 0
    let cursor: string | undefined
    let hasMore = true

    try {
      do {
        const response = await this.getCompanies(cursor, 100)
        if (!response.success || !response.data) {
          errors.push(`Failed to fetch companies: ${response.error}`)
          break
        }

        // Store companies in database
        for (const company of response.data) {
          try {
            await this.storeCompany(company)
            count++
          } catch (error) {
            errors.push(`Failed to store company ${company.id}: ${error}`)
          }
        }

        cursor = response.pagination?.nextCursor
        hasMore = response.pagination?.hasMore || false
      } while (cursor && hasMore)

    } catch (error) {
      errors.push(`Company sync error: ${error}`)
    }

    return { count, errors }
  }

  // Abstract storage methods (to be implemented by database layer)
  protected abstract storeContact(contact: CRMContact): Promise<void>
  protected abstract storeDeal(deal: CRMDeal): Promise<void>
  protected abstract storeCompany(company: CRMCompany): Promise<void>
}
