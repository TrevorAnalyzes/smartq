// HubSpot CRM Provider Implementation

import { BaseCRMProvider } from '../base-provider'
import { 
  CRMConfig, 
  CRMContact, 
  CRMDeal, 
  CRMCompany, 
  CRMApiResponse,
  WebhookEvent,
  HubSpotConfig 
} from '../types'
import { prisma } from '@/lib/prisma'

export class HubSpotProvider extends BaseCRMProvider {
  private baseUrl = 'https://api.hubapi.com'

  constructor(config: CRMConfig, organizationId: string) {
    super(config, organizationId)
  }

  private get hubspotConfig(): HubSpotConfig {
    return this.config as HubSpotConfig
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/crm/v3/objects/contacts', 'GET', null, { limit: 1 })
      return response.ok
    } catch (error) {
      console.error('HubSpot connection test failed:', error)
      return false
    }
  }

  async authenticate(): Promise<boolean> {
    if (this.hubspotConfig.authMethod === 'API_KEY') {
      return !!this.hubspotConfig.credentials.apiKey
    }

    if (this.hubspotConfig.authMethod === 'OAUTH2') {
      return !!this.hubspotConfig.credentials.accessToken
    }

    return false
  }

  async refreshToken(): Promise<boolean> {
    if (this.hubspotConfig.authMethod !== 'OAUTH2' || !this.hubspotConfig.credentials.refreshToken) {
      return false
    }

    try {
      const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.hubspotConfig.credentials.clientId!,
          client_secret: this.hubspotConfig.credentials.clientSecret!,
          refresh_token: this.hubspotConfig.credentials.refreshToken!
        })
      })

      if (response.ok) {
        const data = await response.json()
        this.hubspotConfig.credentials.accessToken = data.access_token
        this.hubspotConfig.credentials.refreshToken = data.refresh_token
        return true
      }
    } catch (error) {
      console.error('HubSpot token refresh failed:', error)
    }

    return false
  }

  async getContacts(cursor?: string, limit = 100): Promise<CRMApiResponse<CRMContact[]>> {
    try {
      const params: any = { 
        limit,
        properties: 'email,firstname,lastname,phone,company,jobtitle,createdate,lastmodifieddate'
      }
      if (cursor) params.after = cursor

      const response = await this.makeRequest('/crm/v3/objects/contacts', 'GET', null, params)
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      const contacts = data.results?.map(this.mapHubSpotContact) || []

      return {
        success: true,
        data: contacts,
        pagination: {
          hasMore: !!data.paging?.next,
          nextCursor: data.paging?.next?.after,
          total: data.total
        }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getContact(id: string): Promise<CRMApiResponse<CRMContact>> {
    try {
      const response = await this.makeRequest(
        `/crm/v3/objects/contacts/${id}`,
        'GET',
        null,
        { properties: 'email,firstname,lastname,phone,company,jobtitle,createdate,lastmodifieddate' }
      )

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      return { success: true, data: this.mapHubSpotContact(data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>> {
    try {
      const hubspotData = this.mapToHubSpotContact(contact)
      const response = await this.makeRequest('/crm/v3/objects/contacts', 'POST', { properties: hubspotData })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      return { success: true, data: this.mapHubSpotContact(data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>> {
    try {
      const hubspotData = this.mapToHubSpotContact(contact)
      const response = await this.makeRequest(`/crm/v3/objects/contacts/${id}`, 'PATCH', { properties: hubspotData })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      return { success: true, data: this.mapHubSpotContact(data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteContact(id: string): Promise<CRMApiResponse<void>> {
    try {
      const response = await this.makeRequest(`/crm/v3/objects/contacts/${id}`, 'DELETE')
      return { success: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Helper methods
  private async makeRequest(endpoint: string, method: string, body?: any, params?: any): Promise<Response> {
    const url = new URL(this.baseUrl + endpoint)
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.hubspotConfig.authMethod === 'API_KEY') {
      headers['Authorization'] = `Bearer ${this.hubspotConfig.credentials.apiKey}`
    } else if (this.hubspotConfig.authMethod === 'OAUTH2') {
      headers['Authorization'] = `Bearer ${this.hubspotConfig.credentials.accessToken}`
    }

    return fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })
  }

  private mapHubSpotContact(hubspotContact: any): CRMContact {
    const props = hubspotContact.properties || {}
    return {
      id: hubspotContact.id,
      email: props.email || '',
      firstName: props.firstname || '',
      lastName: props.lastname || '',
      fullName: `${props.firstname || ''} ${props.lastname || ''}`.trim(),
      phone: props.phone || '',
      company: props.company || '',
      jobTitle: props.jobtitle || '',
      createdAt: new Date(props.createdate || hubspotContact.createdAt),
      updatedAt: new Date(props.lastmodifieddate || hubspotContact.updatedAt),
      customFields: props
    }
  }

  private mapToHubSpotContact(contact: Partial<CRMContact>): any {
    const hubspotData: any = {}
    
    if (contact.email) hubspotData.email = contact.email
    if (contact.firstName) hubspotData.firstname = contact.firstName
    if (contact.lastName) hubspotData.lastname = contact.lastName
    if (contact.phone) hubspotData.phone = contact.phone
    if (contact.company) hubspotData.company = contact.company
    if (contact.jobTitle) hubspotData.jobtitle = contact.jobTitle
    
    return hubspotData
  }

  // Storage methods (implement database operations)
  protected async storeContact(contact: CRMContact): Promise<void> {
    await prisma.cRMContact.upsert({
      where: { 
        organizationId_provider_externalId: {
          organizationId: this.organizationId,
          provider: 'HUBSPOT',
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
        provider: 'HUBSPOT',
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

  // Placeholder implementations for deals and companies (to be completed)
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
