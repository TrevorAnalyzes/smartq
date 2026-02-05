// CRM Provider Factory

import { CRMProvider, CRMConfig } from './types'
import { BaseCRMProvider } from './base-provider'
import { HubSpotProvider } from './providers/hubspot'
import { PipedriveProvider } from './providers/pipedrive'
import { SalesforceProvider } from './providers/salesforce'
import { ZohoProvider } from './providers/zoho'

export class CRMProviderFactory {
  static createProvider(config: CRMConfig, organizationId: string): BaseCRMProvider {
    switch (config.provider) {
      case 'HUBSPOT':
        return new HubSpotProvider(config, organizationId)

      case 'PIPEDRIVE':
        return new PipedriveProvider(config, organizationId)

      case 'SALESFORCE':
        return new SalesforceProvider(config, organizationId)

      case 'ZOHO':
        return new ZohoProvider(config, organizationId)

      default:
        throw new Error(`Unsupported CRM provider: ${config.provider}`)
    }
  }

  static getSupportedProviders(): CRMProvider[] {
    return ['HUBSPOT', 'PIPEDRIVE', 'SALESFORCE', 'ZOHO']
  }

  static getProviderInfo(provider: CRMProvider) {
    const providerInfo = {
      HUBSPOT: {
        name: 'HubSpot',
        description: 'Connect your HubSpot CRM to sync contacts and deals',
        authMethods: ['API_KEY', 'OAUTH2'],
        webhookSupport: true,
        features: ['contacts', 'deals', 'companies', 'real-time-sync'],
        setupUrl: 'https://developers.hubspot.com/docs/api/overview',
        icon: 'hubspot',
        color: '#ff7a59',
      },
      PIPEDRIVE: {
        name: 'Pipedrive',
        description: 'Connect your Pipedrive CRM to sync contacts and deals',
        authMethods: ['API_KEY'],
        webhookSupport: true,
        features: ['contacts', 'deals', 'organizations', 'real-time-sync'],
        setupUrl: 'https://developers.pipedrive.com/docs/api/v1',
        icon: 'pipedrive',
        color: '#1a73e8',
      },
      SALESFORCE: {
        name: 'Salesforce',
        description: 'Connect your Salesforce CRM to sync contacts and opportunities',
        authMethods: ['OAUTH2'],
        webhookSupport: true,
        features: ['contacts', 'opportunities', 'accounts', 'real-time-sync'],
        setupUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/',
        icon: 'salesforce',
        color: '#00a1e0',
      },
      ZOHO: {
        name: 'Zoho CRM',
        description: 'Connect your Zoho CRM to sync contacts and deals',
        authMethods: ['OAUTH2'],
        webhookSupport: true,
        features: ['contacts', 'deals', 'accounts', 'real-time-sync'],
        setupUrl: 'https://www.zoho.com/crm/developer/docs/api/v2/',
        icon: 'zoho',
        color: '#e74c3c',
      },
    }

    return providerInfo[provider]
  }

  static validateConfig(config: CRMConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.provider) {
      errors.push('Provider is required')
    }

    if (!config.authMethod) {
      errors.push('Auth method is required')
    }

    if (!config.credentials || Object.keys(config.credentials).length === 0) {
      errors.push('Credentials are required')
    }

    // Provider-specific validation
    switch (config.provider) {
      case 'HUBSPOT':
        if (config.authMethod === 'API_KEY' && !config.credentials.apiKey) {
          errors.push('HubSpot API key is required')
        }
        if (
          config.authMethod === 'OAUTH2' &&
          (!config.credentials.clientId || !config.credentials.clientSecret)
        ) {
          errors.push('HubSpot OAuth2 client ID and secret are required')
        }
        break

      case 'PIPEDRIVE':
        if (!config.credentials.apiToken) {
          errors.push('Pipedrive API token is required')
        }
        if (!config.credentials.companyDomain) {
          errors.push('Pipedrive company domain is required')
        }
        break

      case 'SALESFORCE':
        if (!config.credentials.clientId || !config.credentials.clientSecret) {
          errors.push('Salesforce OAuth2 client ID and secret are required')
        }
        break

      case 'ZOHO':
        if (!config.credentials.clientId || !config.credentials.clientSecret) {
          errors.push('Zoho OAuth2 client ID and secret are required')
        }
        break
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
