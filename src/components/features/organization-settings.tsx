'use client'

import { useState, useEffect } from 'react'
import { useOrganizationStore } from '@/store/organization-store'
import { useUpdateOrganization } from '@/hooks/use-organizations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { Loader2, Save } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function OrganizationSettings() {
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const updateOrganization = useUpdateOrganization(currentOrganization?.id || '')
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    brandingPrimaryColor: '#0066CC',
    brandingCompanyName: '',
    emailAlerts: true,
    smsAlerts: false,
    webhookUrl: '',
  })

  useEffect(() => {
    if (currentOrganization) {
      setFormData({
        name: currentOrganization.name,
        domain: currentOrganization.domain,
        brandingPrimaryColor: currentOrganization.brandingPrimaryColor,
        brandingCompanyName: currentOrganization.brandingCompanyName || '',
        emailAlerts: currentOrganization.emailAlerts,
        smsAlerts: currentOrganization.smsAlerts,
        webhookUrl: currentOrganization.webhookUrl || '',
      })
    }
  }, [currentOrganization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateOrganization.mutateAsync(formData)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('Failed to save settings. Please try again.')
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
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Customize the appearance of your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandingCompanyName">Company Name</Label>
            <Input
              id="brandingCompanyName"
              placeholder="Your Company Name"
              value={formData.brandingCompanyName}
              onChange={(e) => setFormData({ ...formData, brandingCompanyName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandingPrimaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="brandingPrimaryColor"
                type="color"
                value={formData.brandingPrimaryColor}
                onChange={(e) => setFormData({ ...formData, brandingPrimaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.brandingPrimaryColor}
                onChange={(e) => setFormData({ ...formData, brandingPrimaryColor: e.target.value })}
                placeholder="#0066CC"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailAlerts">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important events
              </p>
            </div>
            <Switch
              id="emailAlerts"
              checked={formData.emailAlerts}
              onCheckedChange={(checked) => setFormData({ ...formData, emailAlerts: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsAlerts">SMS Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive SMS notifications for critical events
              </p>
            </div>
            <Switch
              id="smsAlerts"
              checked={formData.smsAlerts}
              onCheckedChange={(checked) => setFormData({ ...formData, smsAlerts: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-app.com/webhook"
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Receive real-time notifications via webhook
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateOrganization.isPending}>
          {updateOrganization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </form>
  )
}

