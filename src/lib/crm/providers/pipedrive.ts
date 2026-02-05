// Pipedrive CRM Provider Implementation

import { BaseCRMProvider } from '../base-provider'
import {
  CRMConfig,
  CRMContact,
  CRMDeal,
  CRMCompany,
  CRMApiResponse,
  WebhookEvent,
  PipedriveConfig,
} from '../types'
import { prisma } from '@/lib/prisma'

export class PipedriveProvider extends BaseCRMProvider {
  constructor(config: CRMConfig, organizationId: string) {
    super(config, organizationId)
  }

  private get pipedriveConfig(): PipedriveConfig {
    return this.config as PipedriveConfig
  }

  private get baseUrl(): string {
    return `https://${this.pipedriveConfig.credentials.companyDomain}.pipedrive.com/api/v1`
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/users/me')
      return response.ok
    } catch (error) {
      console.error('Pipedrive connection test failed:', error)
      return false
    }
  }

  async authenticate(): Promise<boolean> {
    return !!this.pipedriveConfig.credentials.apiToken
  }

  async refreshToken(): Promise<boolean> {
    // Pipedrive uses API tokens, no refresh needed
    return true
  }

  async getContacts(cursor?: string, limit = 100): Promise<CRMApiResponse<CRMContact[]>> {
    try {
      const params: any = { limit }
      if (cursor) params.start = cursor

      const response = await this.makeRequest('/persons', params)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error || 'Pipedrive API error' }
      }

      const contacts = data.data?.map(this.mapPipedriveContact) || []

      return {
        success: true,
        data: contacts,
        pagination: {
          hasMore: data.additional_data?.pagination?.more_items_in_collection || false,
          nextCursor: data.additional_data?.pagination?.next_start?.toString(),
          total: data.additional_data?.pagination?.total_count,
        },
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getContact(id: string): Promise<CRMApiResponse<CRMContact>> {
    try {
      const response = await this.makeRequest(`/persons/${id}`)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error || 'Pipedrive API error' }
      }

      return { success: true, data: this.mapPipedriveContact(data.data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMApiResponse<CRMContact>> {
    try {
      const pipedriveData = this.mapToPipedriveContact(contact)
      const response = await this.makeRequest('/persons', {}, 'POST', pipedriveData)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error || 'Pipedrive API error' }
      }

      return { success: true, data: this.mapPipedriveContact(data.data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateContact(
    id: string,
    contact: Partial<CRMContact>
  ): Promise<CRMApiResponse<CRMContact>> {
    try {
      const pipedriveData = this.mapToPipedriveContact(contact)
      const response = await this.makeRequest(`/persons/${id}`, {}, 'PUT', pipedriveData)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error || 'Pipedrive API error' }
      }

      return { success: true, data: this.mapPipedriveContact(data.data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteContact(id: string): Promise<CRMApiResponse<void>> {
    try {
      const response = await this.makeRequest(`/persons/${id}`, {}, 'DELETE')
      const data = await response.json()
      return {
        success: response.ok && data.success,
        error: response.ok && data.success ? undefined : data.error || `HTTP ${response.status}`,
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
    url.searchParams.append('api_token', this.pipedriveConfig.credentials.apiToken)

    if (params && method === 'GET') {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    return fetch(url.toString(), options)
  }

  private mapPipedriveContact(pipedriveContact: any): CRMContact {
    return {
      id: pipedriveContact.id?.toString() || '',
      email: pipedriveContact.primary_email || pipedriveContact.email?.[0]?.value || '',
      firstName: pipedriveContact.first_name || '',
      lastName: pipedriveContact.last_name || '',
      fullName: pipedriveContact.name || '',
      phone: pipedriveContact.phone?.[0]?.value || '',
      company: pipedriveContact.org_name || '',
      jobTitle: pipedriveContact.job_title || '',
      createdAt: new Date(pipedriveContact.add_time || Date.now()),
      updatedAt: new Date(pipedriveContact.update_time || Date.now()),
      customFields: pipedriveContact,
    }
  }

  private mapToPipedriveContact(contact: Partial<CRMContact>): any {
    const pipedriveData: any = {}

    if (contact.firstName && contact.lastName) {
      pipedriveData.name = `${contact.firstName} ${contact.lastName}`.trim()
    } else if (contact.fullName) {
      pipedriveData.name = contact.fullName
    }

    if (contact.email) {
      pipedriveData.email = [{ value: contact.email, primary: true }]
    }

    if (contact.phone) {
      pipedriveData.phone = [{ value: contact.phone, primary: true }]
    }

    return pipedriveData
  }

  // Storage method
  protected async storeContact(contact: CRMContact): Promise<void> {
    await prisma.cRMContact.upsert({
      where: {
        organizationId_provider_externalId: {
          organizationId: this.organizationId,
          provider: 'PIPEDRIVE',
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
        provider: 'PIPEDRIVE',
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
