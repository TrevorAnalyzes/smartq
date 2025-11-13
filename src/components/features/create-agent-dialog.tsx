'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Bot } from 'lucide-react'
import { ACCENT_TYPES } from '@/lib/constants'

const accentOptions = [
  {
    value: ACCENT_TYPES.BRITISH_RP,
    label: 'British RP (Received Pronunciation)',
    description: 'Professional, clear accent',
  },
  {
    value: ACCENT_TYPES.BRITISH_NORTHERN,
    label: 'British Northern',
    description: 'Friendly, approachable accent',
  },
  {
    value: ACCENT_TYPES.BRITISH_SCOTTISH,
    label: 'British Scottish',
    description: 'Warm, trustworthy accent',
  },
  {
    value: ACCENT_TYPES.BRITISH_WELSH,
    label: 'British Welsh',
    description: 'Melodic, engaging accent',
  },
  {
    value: ACCENT_TYPES.BRITISH_COCKNEY,
    label: 'British Cockney',
    description: 'Casual, relatable accent',
  },
]

const roleOptions = [
  {
    value: 'customer-service',
    label: 'Customer Service',
    description: 'Handle customer inquiries and support',
  },
  {
    value: 'sales',
    label: 'Sales Assistant',
    description: 'Lead generation and sales conversations',
  },
  {
    value: 'technical-support',
    label: 'Technical Support',
    description: 'Provide technical assistance and troubleshooting',
  },
  {
    value: 'appointment-booking',
    label: 'Appointment Booking',
    description: 'Schedule appointments and manage calendars',
  },
  {
    value: 'lead-qualification',
    label: 'Lead Qualification',
    description: 'Qualify leads and gather information',
  },
]

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    accent: '',
    phoneNumber: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log('Creating agent:', formData)
    setOpen(false)
    // Reset form
    setFormData({
      name: '',
      role: '',
      accent: '',
      phoneNumber: '',
      description: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-brand-primary h-5 w-5" />
            Create New Voice Agent
          </DialogTitle>
          <DialogDescription>
            Configure a new AI voice agent with British accent for your business needs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Sarah, James, Emma"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                placeholder="+44 20 7946 0958"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Agent Role</Label>
            <Select
              value={formData.role}
              onValueChange={value => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agent role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span>{role.label}</span>
                      <span className="text-muted-foreground text-xs">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent">British Accent Type</Label>
            <Select
              value={formData.accent}
              onValueChange={value => setFormData({ ...formData, accent: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select British accent" />
              </SelectTrigger>
              <SelectContent>
                {accentOptions.map(accent => (
                  <SelectItem key={accent.value} value={accent.value}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{accent.label}</span>
                        <Badge
                          variant="outline"
                          className="text-brand-secondary border-brand-secondary text-xs"
                        >
                          British
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">{accent.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the agent's specific purpose or personality traits..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90">
              Create Agent
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
