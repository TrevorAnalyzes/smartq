// Zoho CRM Provider Implementation

import { BaseCRMProvider } from '../base-provider'
import {
  CRMConfig,
  CRMContact,
  CRMDeal,
  CRMCompany,
  CRMApiResponse,
  WebhookEvent,
  ZohoConfig,
} from '../types'
import { prisma } from '@/lib/prisma'

export class ZohoProvider extends BaseCRMProvider {
  constructor(config: CRMConfig, organizationId: string) {
    super(config, organizationId)
  }

  private get zohoConfig(): ZohoConfig {
    return this.config as ZohoConfig
  }

  private get baseUrl(): string {
    const region = this.zohoConfig.credentials.region || 'com'
    return `https://www.zohoapis.${region}/crm/v2`
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.zohoConfig.credentials.accessToken) {
        return false
      }

      const response = await this.makeRequest('/settings/modules')
      return response.ok
    } catch (error) {
      console.error('Zoho connection test failed:', error)
      return false
    }
  }

  async authenticate(): Promise<boolean> {
    return !!this.zohoConfig.credentials.accessToken
  }

  async refreshToken(): Promise<boolean> {
    if (!this.zohoConfig.credentials.refreshToken) {
      return false
    }

    try {
      const region = this.zohoConfig.credentials.region || 'com'
      const response = await fetch(`https://accounts.zoho.${region}/oauth/v2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.zohoConfig.credentials.clientId,
          client_secret: this.zohoConfig.credentials.clientSecret,
          refresh_token: this.zohoConfig.credentials.refreshToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.zohoConfig.credentials.accessToken = data.access_token
        return true
      }
    } catch (error) {
      console.error('Zoho token refresh failed:', error)
    }

    return false
  }

  async getContacts(cursor?: string, limit = 100): Promise<CRMApiResponse<CRMContact[]>> {
    try {
      const params: any = { per_page: limit }
      if (cursor) params.page_token = cursor

      const response = await this.makeRequest('/Contacts', params)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      const contacts = data.data?.map(this.mapZohoContact) || []

      return {
        success: true,
        data: contacts,
        pagination: {
          hasMore: data.info?.more_records || false,
          nextCursor: data.info?.next_page_token,
          total: data.info?.count,
        },
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getContact(id: string): Promise<CRMApiResponse<CRMContact>> {
    try {
      const response = await this.makeRequest(`/Contacts/${id}`)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.data || data.data.length === 0) {
        return { success: false, error: 'Contact not found' }
      }

      return { success: true, data: this.mapZohoContact(data.data[0]) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>> {
    try {
      const zohoData = this.mapToZohoContact(contact)
      const response = await this.makeRequest('/Contacts', {}, 'POST', { data: [zohoData] })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.data || data.data.length === 0 || data.data[0].status !== 'success') {
        return { success: false, error: data.data?.[0]?.message || 'Failed to create contact' }
      }

      // Fetch the created contact to return full data
      return this.getContact(data.data[0].details.id)
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateContact(
    id: string,
    contact: Partial<CRMContact>
  ): Promise<CRMApiResponse<CRMContact>> {
    try {
      const zohoData = this.mapToZohoContact(contact)
      zohoData.id = id
      const response = await this.makeRequest('/Contacts', {}, 'PUT', { data: [zohoData] })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.data || data.data.length === 0 || data.data[0].status !== 'success') {
        return { success: false, error: data.data?.[0]?.message || 'Failed to update contact' }
      }

      // Fetch the updated contact to return full data
      return this.getContact(id)
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteContact(id: string): Promise<CRMApiResponse<void>> {
    try {
      const response = await this.makeRequest(`/Contacts/${id}`, {}, 'DELETE')

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()
      const success = data.data?.[0]?.status === 'success'

      return {
        success,
        error: success ? undefined : data.data?.[0]?.message || 'Failed to delete contact',
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Helper methods
  private async makeRequest(
    endpoint: string,
    params?: any,
    method = 'GET',
    body?: any
  ): Promise<Response> {
    const url = new URL(this.baseUrl + endpoint)

    if (params && method === 'GET') {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    }

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Zoho-oauthtoken ${this.zohoConfig.credentials.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    return fetch(url.toString(), options)
  }

  private mapZohoContact(zohoContact: any): CRMContact {
    return {
      id: zohoContact.id,
      email: zohoContact.Email || '',
      firstName: zohoContact.First_Name || '',
      lastName: zohoContact.Last_Name || '',
      fullName:
        zohoContact.Full_Name ||
        `${zohoContact.First_Name || ''} ${zohoContact.Last_Name || ''}`.trim(),
      phone: zohoContact.Phone || zohoContact.Mobile || '',
      company: zohoContact.Account_Name?.name || '',
      jobTitle: zohoContact.Title || '',
      createdAt: new Date(zohoContact.Created_Time),
      updatedAt: new Date(zohoContact.Modified_Time),
      customFields: zohoContact,
    }
  }

  private mapToZohoContact(contact: Partial<CRMContact>): any {
    const zohoData: any = {}

    if (contact.email) zohoData.Email = contact.email
    if (contact.firstName) zohoData.First_Name = contact.firstName
    if (contact.lastName) zohoData.Last_Name = contact.lastName
    if (contact.phone) zohoData.Phone = contact.phone
    if (contact.jobTitle) zohoData.Title = contact.jobTitle

    return zohoData
  }

  // Storage method
  protected async storeContact(contact: CRMContact): Promise<void> {
    await prisma.cRMContact.upsert({
      where: {
        organizationId_provider_externalId: {
          organizationId: this.organizationId,
          provider: 'ZOHO',
          externalId: contact.id,
        },
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
        updatedAt: contact.updatedAt,
      },
      create: {
        organizationId: this.organizationId,
        provider: 'ZOHO',
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
        updatedAt: contact.updatedAt,
      },
    })
  }

  // Placeholder implementations
  async getDeals(): Promise<CRMApiResponse<CRMDeal[]>> {
    return { success: true, data: [] }
  }
  async getDeal(): Promise<CRMApiResponse<CRMDeal>> {
    throw new Error('Not implemented')
  }
  async createDeal(): Promise<CRMApiResponse<CRMDeal>> {
    throw new Error('Not implemented')
  }
  async updateDeal(): Promise<CRMApiResponse<CRMDeal>> {
    throw new Error('Not implemented')
  }
  async deleteDeal(): Promise<CRMApiResponse<void>> {
    throw new Error('Not implemented')
  }
  async getCompanies(): Promise<CRMApiResponse<CRMCompany[]>> {
    return { success: true, data: [] }
  }
  async getCompany(): Promise<CRMApiResponse<CRMCompany>> {
    throw new Error('Not implemented')
  }
  async createCompany(): Promise<CRMApiResponse<CRMCompany>> {
    throw new Error('Not implemented')
  }
  async updateCompany(): Promise<CRMApiResponse<CRMCompany>> {
    throw new Error('Not implemented')
  }
  async deleteCompany(): Promise<CRMApiResponse<void>> {
    throw new Error('Not implemented')
  }
  async setupWebhook(): Promise<CRMApiResponse<{ webhookId: string }>> {
    throw new Error('Not implemented')
  }
  async removeWebhook(): Promise<CRMApiResponse<void>> {
    throw new Error('Not implemented')
  }
  validateWebhook(): boolean {
    return false
  }
  parseWebhookEvent(): WebhookEvent | null {
    return null
  }
  protected async storeDeal(): Promise<void> {
    /* TODO: Implement */
  }
  protected async storeCompany(): Promise<void> {
    /* TODO: Implement */
  }
}
