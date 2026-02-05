'use client'

import { useState, useEffect } from 'react'
import { useOrganizationStore } from '@/store/organization-store'
import { useUpdateOrganization } from '@/hooks/use-organizations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, Mail, MessageSquare, Webhook } from 'lucide-react'
import { toast } from 'sonner'

const NOTIFICATION_TYPES = [
  {
    id: 'callCompleted',
    label: 'Call Completed',
    description: 'Notify when a call is successfully completed',
  },
  { id: 'callFailed', label: 'Call Failed', description: 'Notify when a call fails or is missed' },
  {
    id: 'agentStatusChanged',
    label: 'Agent Status Changed',
    description: 'Notify when a voice agent status changes',
  },
  {
    id: 'dailySummary',
    label: 'Daily Summary Report',
    description: 'Receive a daily summary of all activities',
  },
  {
    id: 'weeklyAnalytics',
    label: 'Weekly Analytics Report',
    description: 'Receive weekly analytics and insights',
  },
]

export function NotificationsSettingsTab() {
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const updateOrganization = useUpdateOrganization(currentOrganization?.id || '')

  const [formData, setFormData] = useState({
    emailAlerts: true,
    smsAlerts: false,
    webhookUrl: '',
    notificationTypes: {
      callCompleted: true,
      callFailed: true,
      agentStatusChanged: true,
      dailySummary: true,
      weeklyAnalytics: false,
    },
  })

  useEffect(() => {
    if (currentOrganization) {
      setFormData({
        emailAlerts: currentOrganization.emailAlerts,
        smsAlerts: currentOrganization.smsAlerts,
        webhookUrl: currentOrganization.webhookUrl || '',
        notificationTypes: {
          callCompleted: true,
          callFailed: true,
          agentStatusChanged: true,
          dailySummary: true,
          weeklyAnalytics: false,
        },
      })
    }
  }, [currentOrganization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateOrganization.mutateAsync({
        emailAlerts: formData.emailAlerts,
        smsAlerts: formData.smsAlerts,
        webhookUrl: formData.webhookUrl,
      })
      toast.success('Notification settings saved successfully!')
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to save settings. Please try again.')
    }
  }

  const handleTestWebhook = async () => {
    if (!formData.webhookUrl) {
      toast.error('Please enter a webhook URL first')
      return
    }

    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: formData.webhookUrl,
          organizationId: currentOrganization?.id,
        }),
      })

      if (response.ok) {
        toast.success('Test webhook sent successfully!')
      } else {
        toast.error('Failed to send test webhook')
      }
    } catch {
      toast.error('Failed to send test webhook')
    }
  }

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Receive email alerts for important events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailAlerts">Enable Email Alerts</Label>
              <p className="text-muted-foreground text-sm">
                Receive email notifications for important events
              </p>
            </div>
            <Switch
              id="emailAlerts"
              checked={formData.emailAlerts}
              onCheckedChange={checked => setFormData({ ...formData, emailAlerts: checked })}
            />
          </div>

          {formData.emailAlerts && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>Notification Types</Label>
                {NOTIFICATION_TYPES.map(type => (
                  <div key={type.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={type.id}
                      checked={
                        formData.notificationTypes[
                          type.id as keyof typeof formData.notificationTypes
                        ]
                      }
                      onCheckedChange={checked =>
                        setFormData({
                          ...formData,
                          notificationTypes: {
                            ...formData.notificationTypes,
                            [type.id]: checked === true,
                          },
                        })
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={type.id}
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type.label}
                      </label>
                      <p className="text-muted-foreground text-sm">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>SMS Notifications</CardTitle>
          </div>
          <CardDescription>Receive SMS alerts for critical events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsAlerts">Enable SMS Alerts</Label>
              <p className="text-muted-foreground text-sm">
                Receive SMS notifications for critical events
              </p>
            </div>
            <Switch
              id="smsAlerts"
              checked={formData.smsAlerts}
              onCheckedChange={checked => setFormData({ ...formData, smsAlerts: checked })}
            />
          </div>

          {formData.smsAlerts && (
            <>
              <Separator />
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> SMS notifications are only sent for critical events like
                  call failures and system errors to avoid excessive messaging costs.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>Webhook Notifications</CardTitle>
          </div>
          <CardDescription>Receive real-time notifications via webhook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://your-app.com/webhook"
              value={formData.webhookUrl}
              onChange={e => setFormData({ ...formData, webhookUrl: e.target.value })}
            />
            <p className="text-muted-foreground text-sm">
              We'll send POST requests to this URL with event data in JSON format
            </p>
          </div>

          {formData.webhookUrl && (
            <Button type="button" variant="outline" onClick={handleTestWebhook}>
              Test Webhook
            </Button>
          )}

          <Separator />

          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium">Webhook Payload Example</h4>
            <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
              {`{
  "event": "call.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "organizationId": "org_123",
  "data": {
    "conversationId": "conv_456",
    "duration": 180,
    "status": "completed"
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateOrganization.isPending}>
          {updateOrganization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}
