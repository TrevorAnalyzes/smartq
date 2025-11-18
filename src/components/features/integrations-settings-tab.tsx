'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Plug,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOrganizationStore } from '@/store/organization-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TwilioStatus } from './twilio-status'
import { CRMConnectionDialog } from './crm-connection-dialog'

type CRMProvider = 'HUBSPOT' | 'SALESFORCE' | 'PIPEDRIVE' | 'ZOHO'
type CRMStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING'

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
  {
    id: 'ZOHO' as CRMProvider,
    name: 'Zoho CRM',
    icon: Building2,
    description: 'Connect your Zoho CRM to sync contacts and deals',
    color: 'text-purple-500',
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
    case 'SYNCING':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
          Syncing
        </Badge>
      )
    case 'ERROR':
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
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
  isLoading,
}: {
  provider: (typeof CRM_PROVIDERS)[0]
  integration?: CRMIntegration
  onConnect: () => void
  onDisconnect: (provider: CRMProvider) => void
  onSync: (provider: CRMProvider) => void
  isLoading: boolean
}) {
  const Icon = provider.icon

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`rounded-lg bg-gray-100 p-3 ${provider.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold">{provider.name}</h3>
                {integration && getStatusBadge(integration.status)}
              </div>
              <p className="text-muted-foreground text-sm">{provider.description}</p>
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

            <div className="flex gap-2">
              {!integration || integration.status === 'DISCONNECTED' ? (
                <Button onClick={onConnect} disabled={isLoading} size="sm">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Plug className="mr-2 h-4 w-4" />
                  Connect {provider.name}
                </Button>
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
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const queryClient = useQueryClient()
  const [connectionDialog, setConnectionDialog] = useState<{
    open: boolean
    provider: CRMProvider | null
    providerName: string
  }>({
    open: false,
    provider: null,
    providerName: '',
  })

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
    mutationFn: async ({
      provider,
      credentials,
    }: {
      provider: CRMProvider
      credentials: Record<string, string>
    }) => {
      const response = await fetch(`/api/crm/connect?organizationId=${currentOrganization?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          credentials,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to connect CRM')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'] })
      toast.success('CRM connected successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to connect CRM. Please check your credentials.')
    },
  })

  // Disconnect CRM mutation
  const disconnectMutation = useMutation({
    mutationFn: async (provider: CRMProvider) => {
      const response = await fetch(
        `/api/crm/disconnect?organizationId=${currentOrganization?.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
          }),
        }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to disconnect CRM')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'] })
      toast.success('CRM disconnected successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect CRM.')
    },
  })

  // Sync CRM mutation
  const syncMutation = useMutation({
    mutationFn: async (provider: CRMProvider) => {
      const response = await fetch(`/api/crm/sync?organizationId=${currentOrganization?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to sync CRM')
      }
      return response.json()
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'] })
      toast.success(data.message || 'CRM sync completed successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync CRM.')
    },
  })

  const handleConnect = (provider: CRMProvider, providerName: string) => {
    setConnectionDialog({
      open: true,
      provider,
      providerName,
    })
  }

  const handleConnectionSubmit = async (credentials: Record<string, string>) => {
    if (!connectionDialog.provider) return

    try {
      await connectMutation.mutateAsync({
        provider: connectionDialog.provider,
        credentials,
      })
      setConnectionDialog({ open: false, provider: null, providerName: '' })
    } catch {
      // Error is handled by the mutation's onError callback
    }
  }

  return (
    <div className="space-y-6">
      {/* Phone System Integration - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone System Integration
          </CardTitle>
          <CardDescription>
            Configure your Twilio phone system integration for making and receiving calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwilioStatus />
        </CardContent>
      </Card>

      {/* CRM Integration - Organization dependent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            CRM Integration
          </CardTitle>
          <CardDescription>
            Connect your CRM to sync contacts and deals automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentOrganization ? (
            <div className="py-8 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Building2 className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Organization Required</h3>
              <p className="text-muted-foreground">
                Select an organization to manage CRM integrations
              </p>
            </div>
          ) : (
            CRM_PROVIDERS.map(provider => {
              const integration = integrations?.find(i => i.provider === provider.id)
              return (
                <CRMIntegrationCard
                  key={provider.id}
                  provider={provider}
                  integration={integration}
                  onConnect={() => handleConnect(provider.id, provider.name)}
                  onDisconnect={p => disconnectMutation.mutate(p)}
                  onSync={p => syncMutation.mutate(p)}
                  isLoading={
                    connectMutation.isPending ||
                    disconnectMutation.isPending ||
                    syncMutation.isPending
                  }
                />
              )
            })
          )}
        </CardContent>
      </Card>

      {/* CRM Connection Dialog */}
      {connectionDialog.provider && (
        <CRMConnectionDialog
          open={connectionDialog.open}
          onOpenChange={open => setConnectionDialog(prev => ({ ...prev, open }))}
          provider={connectionDialog.provider}
          providerName={connectionDialog.providerName}
          onConnect={handleConnectionSubmit}
          isLoading={connectMutation.isPending}
        />
      )}
    </div>
  )
}
