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
import { Phone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useOrganizationStore } from '@/store/organization-store'

interface CallDialogProps {
  agentId: string
  agentName: string
  children?: React.ReactNode
}

export function CallDialog({ agentId, agentName, children }: CallDialogProps) {
  const [open, setOpen] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const organizationId = currentOrganization?.id

  const handleCall = async () => {
    if (!customerPhone.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    if (!organizationId) {
      toast.error('No organization selected')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/calls?organizationId=${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          customerPhone: customerPhone.trim(),
          customerName: customerName.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate call')
      }

      toast.success(`Call initiated successfully! Call SID: ${data.callSid}`)
      setOpen(false)
      setCustomerPhone('')
      setCustomerName('')
    } catch (error) {
      console.error('Call initiation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to initiate call')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Phone className="mr-2 h-4 w-4" />
            Test Call
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Test Call with {agentName}</DialogTitle>
          <DialogDescription>
            Initiate a real test call using this AI assistant. Enter a valid phone number you have
            access to for testing.
            <br />
            <span className="mt-1 block text-sm text-amber-600">
              ⚠️ This will make an actual phone call using Twilio. Charges may apply.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="+1234567890 or +447700900123"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="col-span-3"
              type="tel"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Customer Name
            </Label>
            <Input
              id="name"
              placeholder="Optional"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="text-muted-foreground rounded-md bg-blue-50 p-3 text-xs">
            <p className="mb-1 font-medium">💡 Testing Tips:</p>
            <ul className="space-y-1">
              <li>• Use your own phone number to test the call functionality</li>
              <li>• Make sure Twilio credentials are configured in your .env file</li>
              <li>• The call will appear as coming from your Twilio phone number</li>
              <li>• Check the browser console and server logs for debugging</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCall} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Start Call
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
