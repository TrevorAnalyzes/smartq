// CRM Integration Types and Interfaces

export type CRMProvider = 'HUBSPOT' | 'PIPEDRIVE' | 'SALESFORCE' | 'ZOHO'

export type CRMStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING'

export type AuthMethod = 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH'

// Base CRM Configuration
export interface CRMConfig {
  provider: CRMProvider
  authMethod: AuthMethod
  credentials: Record<string, string>
  webhookUrl?: string
  customFields?: Record<string, string>
}

// Standardized Contact Structure
export interface CRMContact {
  id: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  phone?: string
  company?: string
  jobTitle?: string
  tags?: string[]
  customFields?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lastActivityAt?: Date
}

// Standardized Deal/Opportunity Structure
export interface CRMDeal {
  id: string
  title: string
  value: number
  currency: string
  stage: string
  probability?: number
  contactId?: string
  companyId?: string
  ownerId?: string
  expectedCloseDate?: Date
  customFields?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Standardized Company Structure
export interface CRMCompany {
  id: string
  name: string
  domain?: string
  industry?: string
  size?: string
  phone?: string
  address?: string
  customFields?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Sync Result
export interface SyncResult {
  success: boolean
  contactsCount: number
  dealsCount: number
  companiesCount: number
  errors: string[]
  lastSyncAt: Date
}

// CRM Integration Database Model
export interface CRMIntegration {
  id: string
  organizationId: string
  provider: CRMProvider
  status: CRMStatus
  config: CRMConfig
  lastSync?: Date
  lastSyncResult?: SyncResult
  contactsCount: number
  dealsCount: number
  companiesCount: number
  webhookSecret?: string
  createdAt: Date
  updatedAt: Date
}

// Webhook Event Types
export type WebhookEventType = 
  | 'contact.created'
  | 'contact.updated' 
  | 'contact.deleted'
  | 'deal.created'
  | 'deal.updated'
  | 'deal.deleted'
  | 'company.created'
  | 'company.updated'
  | 'company.deleted'

export interface WebhookEvent {
  type: WebhookEventType
  provider: CRMProvider
  data: CRMContact | CRMDeal | CRMCompany
  timestamp: Date
}

// API Response Types
export interface CRMApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    hasMore: boolean
    nextCursor?: string
    total?: number
  }
}

// Provider-specific configuration interfaces
export interface HubSpotConfig extends CRMConfig {
  provider: 'HUBSPOT'
  authMethod: 'API_KEY' | 'OAUTH2'
  credentials: {
    apiKey?: string
    accessToken?: string
    refreshToken?: string
    clientId?: string
    clientSecret?: string
  }
}

export interface PipedriveConfig extends CRMConfig {
  provider: 'PIPEDRIVE'
  authMethod: 'API_KEY'
  credentials: {
    apiToken: string
    companyDomain: string
  }
}

export interface SalesforceConfig extends CRMConfig {
  provider: 'SALESFORCE'
  authMethod: 'OAUTH2'
  credentials: {
    clientId: string
    clientSecret: string
    accessToken?: string
    refreshToken?: string
    instanceUrl?: string
  }
}

export interface ZohoConfig extends CRMConfig {
  provider: 'ZOHO'
  authMethod: 'OAUTH2'
  credentials: {
    clientId: string
    clientSecret: string
    accessToken?: string
    refreshToken?: string
    region?: string
  }
}
