'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Building2, 
  Cloud, 
  Database, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Settings,
  ExternalLink,
  Plug
} from 'lucide-react'
import { toast } from 'sonner'
import { useOrganizationStore } from '@/store/organization-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type CRMProvider = 'HUBSPOT' | 'SALESFORCE' | 'PIPEDRIVE'
type CRMStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

interface CRMIntegration {
  id: string
  provider: CRMProvider
  status: CRMStatus
  lastSync?: string
  contactsCount: number
  dealsCount: number
  apiKey?: string
}

const CRM_PROVIDERS = [
  {
    id: 'HUBSPOT' as CRMProvider,
    name: 'HubSpot',
    icon: Building2,
    description: 'Connect your HubSpot CRM to sync contacts and deals',
    color: 'text-orange-500',
  },
  {
    id: 'SALESFORCE' as CRMProvider,
    name: 'Salesforce',
    icon: Cloud,
    description: 'Connect your Salesforce CRM to sync contacts and opportunities',
    color: 'text-blue-500',
  },
  {
    id: 'PIPEDRIVE' as CRMProvider,
    name: 'Pipedrive',
    icon: Database,
    description: 'Connect your Pipedrive CRM to sync contacts and deals',
    color: 'text-green-500',
  },
]

function getStatusBadge(status: CRMStatus) {
  switch (status) {
    case 'CONNECTED':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Connected
        </Badge>
      )
    case 'ERROR':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <AlertCircle className="mr-1 h-3 w-3" />
          Error
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary">
          <XCircle className="mr-1 h-3 w-3" />
          Not Connected
        </Badge>
      )
  }
}

function CRMIntegrationCard({ 
  provider, 
  integration,
  onConnect,
  onDisconnect,
  onSync,
  isLoading 
}: { 
  provider: typeof CRM_PROVIDERS[0]
  integration?: CRMIntegration
  onConnect: (provider: CRMProvider, apiKey: string) => void
  onDisconnect: (provider: CRMProvider) => void
  onSync: (provider: CRMProvider) => void
  isLoading: boolean
}) {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const Icon = provider.icon

  const handleConnect = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }
    onConnect(provider.id, apiKey)
    setApiKey('')
    setShowApiKeyInput(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg bg-gray-100 ${provider.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{provider.name}</h3>
                {integration && getStatusBadge(integration.status)}
              </div>
              <p className="text-sm text-muted-foreground">{provider.description}</p>
            </div>

            {integration?.status === 'CONNECTED' && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Sync</p>
                  <p className="font-medium">
                    {integration.lastSync 
                      ? new Date(integration.lastSync).toLocaleString() 
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contacts</p>
                  <p className="font-medium">{integration.contactsCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deals</p>
                  <p className="font-medium">{integration.dealsCount.toLocaleString()}</p>
                </div>
              </div>
            )}

            {showApiKeyInput && (
              <div className="space-y-2">
                <Label htmlFor={`apiKey-${provider.id}`}>API Key</Label>
                <Input
                  id={`apiKey-${provider.id}`}
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2">
              {!integration || integration.status === 'DISCONNECTED' ? (
                <>
                  {showApiKeyInput ? (
                    <>
                      <Button onClick={handleConnect} disabled={isLoading} size="sm">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Plug className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                      <Button
                        onClick={() => setShowApiKeyInput(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setShowApiKeyInput(true)} size="sm">
                      <Plug className="mr-2 h-4 w-4" />
                      Connect {provider.name}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    onClick={() => onDisconnect(provider.id)}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Disconnect
                  </Button>
                  <Button
                    onClick={() => onSync(provider.id)}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function IntegrationsSettingsTab() {
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const queryClient = useQueryClient()

  // Fetch CRM integrations
  const { data: integrations } = useQuery<CRMIntegration[]>({
    queryKey: ['crm-integrations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return []
      const response = await fetch(`/api/crm/status?organizationId=${currentOrganization.id}`)
      if (!response.ok) throw new Error('Failed to fetch CRM integrations')
      return response.json()
    },
    enabled: !!currentOrganization?.id,
  })

  // Connect CRM mutation
  const connectMutation = useMutation({
    mutationFn: async ({ provider, apiKey }: { provider: CRMProvider; apiKey: string }) => {
      const response = await fetch('/api/crm/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrganization?.id,
          provider,
          apiKey,
        }),
      })
      if (!response.ok) throw new Error('Failed to connect CRM')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'] })
      toast.success('CRM connected successfully!')
    },
    onError: () => {
      toast.error('Failed to connect CRM. Please check your API key.')
    },
  })

  // Disconnect CRM mutation
  const disconnectMutation = useMutation({
    mutationFn: async (provider: CRMProvider) => {
      const response = await fetch('/api/crm/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrganization?.id,
          provider,
        }),
      })
      if (!response.ok) throw new Error('Failed to disconnect CRM')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'] })
      toast.success('CRM disconnected successfully!')
    },
    onError: () => {
      toast.error('Failed to disconnect CRM.')
    },
  })

  // Sync CRM mutation
  const syncMutation = useMutation({
    mutationFn: async (provider: CRMProvider) => {
      const response = await fetch('/api/crm/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrganization?.id,
          provider,
        }),
      })
      if (!response.ok) throw new Error('Failed to sync CRM')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'] })
      toast.success('CRM sync started! This may take a few minutes.')
    },
    onError: () => {
      toast.error('Failed to sync CRM.')
    },
  })

  if (!currentOrganization) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Please select an organization first</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CRM Integration</CardTitle>
          <CardDescription>
            Connect your CRM to sync contacts and deals automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CRM_PROVIDERS.map((provider) => {
            const integration = integrations?.find((i) => i.provider === provider.id)
            return (
              <CRMIntegrationCard
                key={provider.id}
                provider={provider}
                integration={integration}
                onConnect={(p, apiKey) => connectMutation.mutate({ provider: p, apiKey })}
                onDisconnect={(p) => disconnectMutation.mutate(p)}
                onSync={(p) => syncMutation.mutate(p)}
                isLoading={
                  connectMutation.isPending ||
                  disconnectMutation.isPending ||
                  syncMutation.isPending
                }
              />
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phone System</CardTitle>
          <CardDescription>
            Configure your phone system integration for making and receiving calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-gray-100 text-red-500">
              <Phone className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Twilio</h3>
                  <Badge className="bg-blue-500 hover:bg-blue-600">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Phone system integration will be available in the next release. You'll be able to
                  configure Twilio for making and receiving calls with your AI voice agents.
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

