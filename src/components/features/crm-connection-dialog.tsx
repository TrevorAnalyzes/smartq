'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { CRMProvider } from '@/lib/crm/types'

interface CRMConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: CRMProvider
  providerName: string
  onConnect: (credentials: Record<string, string>) => Promise<void>
  isLoading: boolean
}

export function CRMConnectionDialog({
  open,
  onOpenChange,
  provider,
  providerName,
  onConnect,
  isLoading
}: CRMConnectionDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onConnect(credentials)
  }

  const updateCredential = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }))
  }

  const getCredentialFields = () => {
    switch (provider) {
      case 'HUBSPOT':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your HubSpot API key"
                value={credentials.apiKey || ''}
                onChange={(e) => updateCredential('apiKey', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your API key from HubSpot Settings → Integrations → API key
              </p>
            </div>
          </div>
        )

      case 'PIPEDRIVE':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Enter your Pipedrive API token"
                value={credentials.apiToken || ''}
                onChange={(e) => updateCredential('apiToken', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="companyDomain">Company Domain</Label>
              <Input
                id="companyDomain"
                placeholder="your-company"
                value={credentials.companyDomain || ''}
                onChange={(e) => updateCredential('companyDomain', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your Pipedrive domain (e.g., "your-company" from your-company.pipedrive.com)
              </p>
            </div>
          </div>
        )

      case 'SALESFORCE':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Salesforce uses OAuth2 authentication. You'll be redirected to Salesforce to authorize the connection.
              </p>
            </div>
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                placeholder="Enter your Salesforce Client ID"
                value={credentials.clientId || ''}
                onChange={(e) => updateCredential('clientId', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Enter your Salesforce Client Secret"
                value={credentials.clientSecret || ''}
                onChange={(e) => updateCredential('clientSecret', e.target.value)}
                required
              />
            </div>
          </div>
        )

      case 'ZOHO':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                Zoho CRM uses OAuth2 authentication. You'll be redirected to Zoho to authorize the connection.
              </p>
            </div>
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                placeholder="Enter your Zoho Client ID"
                value={credentials.clientId || ''}
                onChange={(e) => updateCredential('clientId', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Enter your Zoho Client Secret"
                value={credentials.clientSecret || ''}
                onChange={(e) => updateCredential('clientSecret', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={credentials.region || 'com'} onValueChange={(value) => updateCredential('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your Zoho region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="com">Global (.com)</SelectItem>
                  <SelectItem value="eu">Europe (.eu)</SelectItem>
                  <SelectItem value="in">India (.in)</SelectItem>
                  <SelectItem value="com.au">Australia (.com.au)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect {providerName}</DialogTitle>
          <DialogDescription>
            Enter your {providerName} credentials to connect your CRM integration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {getCredentialFields()}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect {providerName}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
