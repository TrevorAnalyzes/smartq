// Salesforce CRM Provider Implementation

import { BaseCRMProvider } from '../base-provider'
import { 
  CRMConfig, 
  CRMContact, 
  CRMDeal, 
  CRMCompany, 
  CRMApiResponse,
  WebhookEvent,
  SalesforceConfig 
} from '../types'
import { prisma } from '@/lib/prisma'

export class SalesforceProvider extends BaseCRMProvider {
  constructor(config: CRMConfig, organizationId: string) {
    super(config, organizationId)
  }

  private get salesforceConfig(): SalesforceConfig {
    return this.config as SalesforceConfig
  }

  private get baseUrl(): string {
    return this.salesforceConfig.credentials.instanceUrl || 'https://login.salesforce.com'
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.salesforceConfig.credentials.accessToken) {
        return false
      }

      const response = await this.makeRequest('/services/data/v58.0/sobjects/Contact/describe')
      return response.ok
    } catch (error) {
      console.error('Salesforce connection test failed:', error)
      return false
    }
  }

  async authenticate(): Promise<boolean> {
    return !!this.salesforceConfig.credentials.accessToken
  }

  async refreshToken(): Promise<boolean> {
    if (!this.salesforceConfig.credentials.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.salesforceConfig.credentials.clientId,
          client_secret: this.salesforceConfig.credentials.clientSecret,
          refresh_token: this.salesforceConfig.credentials.refreshToken
        })
      })

      if (response.ok) {
        const data = await response.json()
        this.salesforceConfig.credentials.accessToken = data.access_token
        this.salesforceConfig.credentials.instanceUrl = data.instance_url
        return true
      }
    } catch (error) {
      console.error('Salesforce token refresh failed:', error)
    }

    return false
  }

  async getContacts(cursor?: string, limit = 100): Promise<CRMApiResponse<CRMContact[]>> {
    try {
      // Salesforce uses SOQL queries
      const query = `SELECT Id, Email, FirstName, LastName, Phone, Account.Name, Title, CreatedDate, LastModifiedDate FROM Contact LIMIT ${limit}`
      const response = await this.makeRequest(`/services/data/v58.0/query?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      const contacts = data.records?.map(this.mapSalesforceContact) || []

      return {
        success: true,
        data: contacts,
        pagination: {
          hasMore: !data.done,
          nextCursor: data.nextRecordsUrl,
          total: data.totalSize
        }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getContact(id: string): Promise<CRMApiResponse<CRMContact>> {
    try {
      const response = await this.makeRequest(`/services/data/v58.0/sobjects/Contact/${id}`)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      return { success: true, data: this.mapSalesforceContact(data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>> {
    try {
      const salesforceData = this.mapToSalesforceContact(contact)
      const response = await this.makeRequest('/services/data/v58.0/sobjects/Contact', 'POST', salesforceData)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      // Fetch the created contact to return full data
      return this.getContact(data.id)
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>> {
    try {
      const salesforceData = this.mapToSalesforceContact(contact)
      const response = await this.makeRequest(`/services/data/v58.0/sobjects/Contact/${id}`, 'PATCH', salesforceData)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      // Fetch the updated contact to return full data
      return this.getContact(id)
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteContact(id: string): Promise<CRMApiResponse<void>> {
    try {
      const response = await this.makeRequest(`/services/data/v58.0/sobjects/Contact/${id}`, 'DELETE')
      return { success: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Helper methods
  private async makeRequest(endpoint: string, method = 'GET', body?: any): Promise<Response> {
    const url = this.baseUrl + endpoint

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.salesforceConfig.credentials.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    return fetch(url, options)
  }

  private mapSalesforceContact(salesforceContact: any): CRMContact {
    return {
      id: salesforceContact.Id,
      email: salesforceContact.Email || '',
      firstName: salesforceContact.FirstName || '',
      lastName: salesforceContact.LastName || '',
      fullName: `${salesforceContact.FirstName || ''} ${salesforceContact.LastName || ''}`.trim(),
      phone: salesforceContact.Phone || '',
      company: salesforceContact.Account?.Name || '',
      jobTitle: salesforceContact.Title || '',
      createdAt: new Date(salesforceContact.CreatedDate),
      updatedAt: new Date(salesforceContact.LastModifiedDate),
      customFields: salesforceContact
    }
  }

  private mapToSalesforceContact(contact: Partial<CRMContact>): any {
    const salesforceData: any = {}
    
    if (contact.email) salesforceData.Email = contact.email
    if (contact.firstName) salesforceData.FirstName = contact.firstName
    if (contact.lastName) salesforceData.LastName = contact.lastName
    if (contact.phone) salesforceData.Phone = contact.phone
    if (contact.jobTitle) salesforceData.Title = contact.jobTitle
    
    return salesforceData
  }

  // Storage method
  protected async storeContact(contact: CRMContact): Promise<void> {
    await prisma.cRMContact.upsert({
      where: { 
        organizationId_provider_externalId: {
          organizationId: this.organizationId,
          provider: 'SALESFORCE',
          externalId: contact.id
        }
      },
      update: {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: contact.fullName,
        phone: contact.phone,
        company: contact.company,
        jobTitle: contact.jobTitle,
        customFields: contact.customFields,
        updatedAt: contact.updatedAt
      },
      create: {
        organizationId: this.organizationId,
        provider: 'SALESFORCE',
        externalId: contact.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: contact.fullName,
        phone: contact.phone,
        company: contact.company,
        jobTitle: contact.jobTitle,
        customFields: contact.customFields,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    })
  }

  // Placeholder implementations
  async getDeals(): Promise<CRMApiResponse<CRMDeal[]>> { return { success: true, data: [] } }
  async getDeal(): Promise<CRMApiResponse<CRMDeal>> { throw new Error('Not implemented') }
  async createDeal(): Promise<CRMApiResponse<CRMDeal>> { throw new Error('Not implemented') }
  async updateDeal(): Promise<CRMApiResponse<CRMDeal>> { throw new Error('Not implemented') }
  async deleteDeal(): Promise<CRMApiResponse<void>> { throw new Error('Not implemented') }
  async getCompanies(): Promise<CRMApiResponse<CRMCompany[]>> { return { success: true, data: [] } }
  async getCompany(): Promise<CRMApiResponse<CRMCompany>> { throw new Error('Not implemented') }
  async createCompany(): Promise<CRMApiResponse<CRMCompany>> { throw new Error('Not implemented') }
  async updateCompany(): Promise<CRMApiResponse<CRMCompany>> { throw new Error('Not implemented') }
  async deleteCompany(): Promise<CRMApiResponse<void>> { throw new Error('Not implemented') }
  async setupWebhook(): Promise<CRMApiResponse<{ webhookId: string }>> { throw new Error('Not implemented') }
  async removeWebhook(): Promise<CRMApiResponse<void>> { throw new Error('Not implemented') }
  validateWebhook(): boolean { return false }
  parseWebhookEvent(): WebhookEvent | null { return null }
  protected async storeDeal(): Promise<void> { /* TODO: Implement */ }
  protected async storeCompany(): Promise<void> { /* TODO: Implement */ }
}
