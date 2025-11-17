'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface TwilioStatus {
  configured: boolean
  accountSid: boolean
  authToken: boolean
  phoneNumber: boolean
  webhookUrl: boolean
  mediaStreamUrl: boolean
}

export function TwilioStatus() {
  const [status, setStatus] = useState<TwilioStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkTwilioStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/twilio/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        setStatus({
          configured: false,
          accountSid: false,
          authToken: false,
          phoneNumber: false,
          webhookUrl: false,
          mediaStreamUrl: false,
        })
      }
    } catch (error) {
      console.error('Failed to check Twilio status:', error)
      setStatus({
        configured: false,
        accountSid: false,
        authToken: false,
        phoneNumber: false,
        webhookUrl: false,
        mediaStreamUrl: false,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTwilioStatus()
  }, [])

  const getStatusIcon = (isConfigured: boolean) => {
    if (isConfigured) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (isConfigured: boolean) => {
    if (isConfigured) {
      return <Badge className="bg-green-100 text-green-800">Configured</Badge>
    }
    return <Badge variant="destructive">Missing</Badge>
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Checking Twilio configuration...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {status.configured ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              Twilio Configuration Status
            </CardTitle>
            <CardDescription>
              Check if Twilio is properly configured for making calls
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkTwilioStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.accountSid)}
              <span className="text-sm">TWILIO_ACCOUNT_SID</span>
            </div>
            {getStatusBadge(status.accountSid)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.authToken)}
              <span className="text-sm">TWILIO_AUTH_TOKEN</span>
            </div>
            {getStatusBadge(status.authToken)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.phoneNumber)}
              <span className="text-sm">TWILIO_PHONE_NUMBER</span>
            </div>
            {getStatusBadge(status.phoneNumber)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.webhookUrl)}
              <span className="text-sm">TWILIO_WEBHOOK_BASE_URL</span>
            </div>
            {getStatusBadge(status.webhookUrl)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.mediaStreamUrl)}
              <span className="text-sm">TWILIO_MEDIA_STREAM_URL</span>
            </div>
            {getStatusBadge(status.mediaStreamUrl)}
          </div>
        </div>
        
        {!status.configured && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Setup Required:</strong> Please configure the missing Twilio environment variables in your .env file to enable calling functionality.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
