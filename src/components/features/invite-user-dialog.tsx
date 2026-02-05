'use client'

import { useState } from 'react'
import { useCreateUser } from '@/hooks/use-users'
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

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
}

export function InviteUserDialog({ open, onOpenChange, organizationId }: InviteUserDialogProps) {
  const createUser = useCreateUser()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await createUser.mutateAsync({
        ...formData,
        organizationId,
        permissions: getDefaultPermissions(formData.role),
      })
      onOpenChange(false)
      setFormData({ name: '', email: '', role: 'viewer' })
    } catch (error: unknown) {
      const errorWithMessage = toErrorWithMessage(error)
      setErrors({ submit: errorWithMessage.message || 'Failed to invite user' })
    }
  }

  const getDefaultPermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['manage_agents', 'manage_users', 'view_analytics', 'manage_settings']
      case 'manager':
        return ['manage_agents', 'view_analytics']
      case 'agent':
        return ['view_analytics']
      case 'viewer':
      default:
        return []
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setFormData({ name: '', email: '', role: 'viewer' })
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization. They'll receive an email with
            instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={value => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Admin</span>
                    <span className="text-muted-foreground text-xs">
                      Full access to all features
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Manager</span>
                    <span className="text-muted-foreground text-xs">
                      Manage agents and view analytics
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="agent">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Agent</span>
                    <span className="text-muted-foreground text-xs">View analytics only</span>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Viewer</span>
                    <span className="text-muted-foreground text-xs">Read-only access</span>
                  </div>
                </SelectItem>
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
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
