import { z } from 'zod'

// Validation schemas using Zod for the AI Voice Agent Dashboard

export const voiceAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(100, 'Name too long'),
  accentType: z.enum([
    'british-rp',
    'british-cockney',
    'british-scottish',
    'british-welsh',
    'british-northern',
  ]),
  phoneNumber: z.string().optional(),
  description: z.string().max(500, 'Description too long').optional(),
})

export const conversationSchema = z.object({
  customerPhone: z.string().min(10, 'Valid phone number required'),
  customerName: z.string().optional(),
  outcome: z.string().optional(),
})

export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
  domain: z.string().url('Valid domain required'),
  plan: z.enum(['free', 'pro', 'enterprise']),
})

export const userSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'manager', 'agent', 'viewer']),
})

export const organizationSettingsSchema = z.object({
  defaultAccent: z.string(),
  crmProvider: z.enum(['hubspot', 'salesforce', 'pipedrive']).optional(),
  crmApiKey: z.string().optional(),
  notificationPreferences: z.object({
    emailAlerts: z.boolean(),
    smsAlerts: z.boolean(),
    webhookUrl: z.string().url().optional(),
  }),
  branding: z
    .object({
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Valid hex color required'),
      logo: z.string().url().optional(),
      companyName: z.string().min(1, 'Company name required'),
    })
    .optional(),
})

export const crmIntegrationSchema = z.object({
  provider: z.enum(['hubspot', 'salesforce', 'pipedrive']),
  apiKey: z.string().min(1, 'API key is required'),
  webhookUrl: z.string().url().optional(),
})

// Type inference from schemas
export type VoiceAgentInput = z.infer<typeof voiceAgentSchema>
export type ConversationInput = z.infer<typeof conversationSchema>
export type OrganizationInput = z.infer<typeof organizationSchema>
export type UserInput = z.infer<typeof userSchema>
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>
export type CRMIntegrationInput = z.infer<typeof crmIntegrationSchema>
