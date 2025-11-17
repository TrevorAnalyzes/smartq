// TypeScript type definitions for the AI Voice Agent Dashboard
import { Prisma } from '@prisma/client'
import { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge'

// Re-export Prisma enums for use in API routes
export { AccentType, UserRole, OrganizationPlan, ConversationStatus, Sentiment, AgentStatus, CRMProvider } from '@prisma/client'

// Base types from Prisma
export type Organization = Prisma.OrganizationGetPayload<object>
export type User = Prisma.UserGetPayload<object>
export type VoiceAgent = Prisma.VoiceAgentGetPayload<object>
export type Conversation = Prisma.ConversationGetPayload<object>
export type CRMIntegration = Prisma.CRMIntegrationGetPayload<object>
export type UsageEvent = Prisma.UsageEventGetPayload<object>
export type Activity = Prisma.ActivityGetPayload<object>

// Extended types for API responses with joined data
export type VoiceAgentWithCount = Prisma.VoiceAgentGetPayload<{
  include: {
    _count: {
      select: { conversations: true }
    }
  }
}>

export type ConversationWithAgent = Prisma.ConversationGetPayload<{
  include: {
    agent: {
      select: {
        id: true
        name: true
        accentType: true
        phoneNumber: true
      }
    }
  }
}>

export type OrganizationWithCounts = Prisma.OrganizationGetPayload<{
  include: {
    _count: {
      select: {
        users: true
        voiceAgents: true
        conversations: true
      }
    }
  }
}>

export type UserWithOrganization = Prisma.UserGetPayload<{
  include: {
    organization: {
      select: {
        id: true
        name: true
        domain: true
      }
    }
  }
}>

// Prisma input types for API routes
export type VoiceAgentWhereInput = Prisma.VoiceAgentWhereInput
export type VoiceAgentUpdateInput = Prisma.VoiceAgentUpdateInput
export type ConversationWhereInput = Prisma.ConversationWhereInput
export type ConversationUpdateInput = Prisma.ConversationUpdateInput
export type OrganizationWhereInput = Prisma.OrganizationWhereInput
export type OrganizationUpdateInput = Prisma.OrganizationUpdateInput
export type UserWhereInput = Prisma.UserWhereInput
export type UserUpdateInput = Prisma.UserUpdateInput

// Badge variant type
export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

// Error handling types
export type ErrorWithMessage = {
  message: string
  name?: string
  stack?: string
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

// Navigation types for sidebar
export interface NavigationItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: {
    variant: BadgeVariant
    text: string
  } | null
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Dashboard types
export interface DashboardStats {
  totalAgents: number
  activeAgents: number
  totalConversations: number
  avgDuration: number
}

export interface AnalyticsData {
  dateRange: {
    start: Date
    end: Date
    days: number
  }
  summary: {
    totalConversations: number
    trend: number
  }
  sentimentDistribution: Array<{
    sentiment: string
    count: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
  }>
  performanceByAgent: Array<{
    agentId: string
    agentName: string
    averageDuration: number
    totalCalls: number
  }>
  hourlyDistribution: Array<{
    hour: number
    count: number
  }>
  dailyStats: Array<{
    date: string
    totalCalls: number
    successfulCalls: number
    successRate: number
  }>
}

// Legacy interfaces for backward compatibility
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
