'use client'

import { useState } from 'react'
import { useCreateOrganization } from '@/hooks/use-organizations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toErrorWithMessage } from '@/lib/types'

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({ open, onOpenChange }: CreateOrganizationDialogProps) {
  const createOrganization = useCreateOrganization()
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    plan: 'free',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Organization name is required'
    if (!formData.domain.trim()) newErrors.domain = 'Domain is required'
    if (!formData.domain.startsWith('http')) {
      newErrors.domain = 'Domain must start with http:// or https://'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await createOrganization.mutateAsync(formData)
      onOpenChange(false)
      setFormData({ name: '', domain: '', plan: 'free' })
    } catch (error: unknown) {
      const errorWithMessage = toErrorWithMessage(error)
      setErrors({ submit: errorWithMessage.message || 'Failed to create organization' })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setFormData({ name: '', domain: '', plan: 'free' })
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Add a new organization to manage separately with its own team and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              placeholder="Acme Corporation"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="https://acme.com"
              value={formData.domain}
              onChange={e => setFormData({ ...formData, domain: e.target.value })}
              className={errors.domain ? 'border-destructive' : ''}
            />
            {errors.domain && <p className="text-destructive text-sm">{errors.domain}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select
              value={formData.plan}
              onValueChange={value => setFormData({ ...formData, plan: value })}
            >
              <SelectTrigger id="plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errors.submit && (
            <div className="bg-destructive/10 rounded-md p-3">
              <p className="text-destructive text-sm">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrganization.isPending}>
              {createOrganization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
