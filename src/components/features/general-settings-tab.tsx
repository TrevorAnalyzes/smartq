'use client'

import { useState, useEffect } from 'react'
import { useOrganizationStore } from '@/store/organization-store'
import { useUpdateOrganization } from '@/hooks/use-organizations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Loader2, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'

const ACCENT_OPTIONS = [
  {
    value: 'BRITISH_RP',
    label: 'British RP (Received Pronunciation)',
    description: 'Standard British accent used in formal settings',
  },
  {
    value: 'BRITISH_COCKNEY',
    label: 'British Cockney',
    description: 'Traditional East London accent',
  },
  { value: 'BRITISH_SCOTTISH', label: 'British Scottish', description: 'Scottish accent' },
  { value: 'BRITISH_WELSH', label: 'British Welsh', description: 'Welsh accent' },
  { value: 'BRITISH_NORTHERN', label: 'British Northern', description: 'Northern England accent' },
]

const PLAN_COLORS = {
  FREE: 'bg-gray-500',
  PRO: 'bg-blue-500',
  ENTERPRISE: 'bg-purple-500',
}

export function GeneralSettingsTab() {
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const updateOrganization = useUpdateOrganization(currentOrganization?.id || '')

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    brandingPrimaryColor: '#0066CC',
    brandingCompanyName: '',
    defaultAccent: 'BRITISH_RP',
  })

  useEffect(() => {
    if (currentOrganization) {
      setFormData({
        name: currentOrganization.name,
        domain: currentOrganization.domain,
        brandingPrimaryColor: currentOrganization.brandingPrimaryColor,
        brandingCompanyName: currentOrganization.brandingCompanyName || '',
        defaultAccent: currentOrganization.defaultAccent || 'BRITISH_RP',
      })
    }
  }, [currentOrganization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateOrganization.mutateAsync(formData)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to save settings. Please try again.')
    }
  }

  if (!currentOrganization) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="space-y-4 text-center">
            <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <Building2 className="text-muted-foreground h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Organization Selected</h3>
              <p className="text-muted-foreground">
                Create or select an organization to manage settings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedAccent = ACCENT_OPTIONS.find(a => a.value === formData.defaultAccent)
  const planKey = (currentOrganization.plan || 'FREE').toUpperCase() as keyof typeof PLAN_COLORS

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={e => setFormData({ ...formData, domain: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Current Plan</Label>
            <div className="flex items-center gap-2">
              <Badge className={PLAN_COLORS[planKey]}>{planKey}</Badge>
              {planKey !== 'ENTERPRISE' && (
                <span className="text-muted-foreground text-sm">
                  • Upgrade to {planKey === 'FREE' ? 'PRO or ENTERPRISE' : 'ENTERPRISE'} for more
                  features
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize the appearance of your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandingCompanyName">Company Name</Label>
            <Input
              id="brandingCompanyName"
              placeholder="Your Company Name"
              value={formData.brandingCompanyName}
              onChange={e => setFormData({ ...formData, brandingCompanyName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandingPrimaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="brandingPrimaryColor"
                type="color"
                value={formData.brandingPrimaryColor}
                onChange={e => setFormData({ ...formData, brandingPrimaryColor: e.target.value })}
                className="h-10 w-20"
              />
              <Input
                value={formData.brandingPrimaryColor}
                onChange={e => setFormData({ ...formData, brandingPrimaryColor: e.target.value })}
                placeholder="#0066CC"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <Button type="button" variant="outline" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="text-muted-foreground mt-1 text-sm">
                  Coming Soon - Logo upload will be available in the next release
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voice Agent Defaults</CardTitle>
          <CardDescription>Default settings for new voice agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultAccent">Default Accent</Label>
            <Select
              value={formData.defaultAccent}
              onValueChange={value => setFormData({ ...formData, defaultAccent: value })}
            >
              <SelectTrigger id="defaultAccent">
                <SelectValue placeholder="Select default accent" />
              </SelectTrigger>
              <SelectContent>
                {ACCENT_OPTIONS.map(accent => (
                  <SelectItem key={accent.value} value={accent.value}>
                    {accent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccent && (
              <p className="text-muted-foreground text-sm">{selectedAccent.description}</p>
            )}
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
