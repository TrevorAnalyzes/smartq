// TypeScript type definitions for the AI Voice Agent Dashboard

export interface VoiceAgent {
  id: string
  name: string
  status: 'active' | 'inactive' | 'maintenance' | 'error'
  accentType: string
  phoneNumber?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  agentId: string
  customerPhone: string
  customerName?: string
  status: 'CONNECTED' | 'RINGING' | 'ENDED' | 'FAILED'
  duration?: number
  transcript?: string
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  outcome?: string
  topic?: string
  startedAt: Date
  endedAt?: Date
}

export interface Organization {
  id: string
  name: string
  domain: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  settings: OrganizationSettings
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSettings {
  defaultAccent: string
  crmProvider?: string
  crmApiKey?: string
  notificationPreferences: NotificationPreferences
  branding?: BrandingSettings
}

export interface NotificationPreferences {
  emailAlerts: boolean
  smsAlerts: boolean
  webhookUrl?: string
}

export interface BrandingSettings {
  primaryColor: string
  logo?: string
  companyName: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  organizationId: string
  permissions: string[]
  createdAt: Date
  lastLoginAt?: Date
}

export interface DashboardMetrics {
  activeAgents: number
  totalCalls: number
  successRate: number
  revenueGenerated: number
  averageCallDuration: number
  avgDuration?: number
  customerSatisfaction: number
}

export interface CallAnalytics {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageDuration: number
  peakHours: number[]
  conversionRate: number
}

export interface CRMIntegration {
  provider: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
  contactsCount?: number
  dealsCount?: number
}
