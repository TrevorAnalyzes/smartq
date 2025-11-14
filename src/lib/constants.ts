// Application constants for SmartQ

export const APP_CONFIG = {
  name: 'SmartQ',
  description: 'Helping UK businesses create an online presence to increase revenue',
  version: '1.0.0',
} as const

export const ROUTES = {
  dashboard: '/',
  agents: '/agents',
  analytics: '/analytics',
  conversations: '/conversations',
  organizations: '/organizations',
  settings: '/settings',
} as const

export const COLORS = {
  primary: '#2563EB', // Clean SaaS Blue primary
  secondary: '#0F172A', // Deep navy text / secondary
  accent: '#22C55E', // Green accent
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
} as const

export const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  ERROR: 'error',
} as const

export const CALL_STATUS = {
  CONNECTED: 'connected',
  RINGING: 'ringing',
  ENDED: 'ended',
  FAILED: 'failed',
} as const

export const ACCENT_TYPES = {
  BRITISH_RP: 'british-rp',
  BRITISH_COCKNEY: 'british-cockney',
  BRITISH_SCOTTISH: 'british-scottish',
  BRITISH_WELSH: 'british-welsh',
  BRITISH_NORTHERN: 'british-northern',
} as const

export const CRM_PROVIDERS = {
  HUBSPOT: 'hubspot',
  SALESFORCE: 'salesforce',
  PIPEDRIVE: 'pipedrive',
} as const
