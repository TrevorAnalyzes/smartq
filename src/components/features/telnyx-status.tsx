'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface TelnyxStatus {
  configured: boolean
  apiKey: boolean
  connectionId: boolean
  fromNumber: boolean
  webhookUrl: boolean
  mediaStreamUrl: boolean
}

export function TelnyxStatus() {
  const [status, setStatus] = useState<TelnyxStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkTelnyxStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/telnyx/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        setStatus({
          configured: false,
          apiKey: false,
          connectionId: false,
          fromNumber: false,
          webhookUrl: false,
          mediaStreamUrl: false,
        })
      }
    } catch (error) {
      console.error('Failed to check Telnyx status:', error)
      setStatus({
        configured: false,
        apiKey: false,
        connectionId: false,
        fromNumber: false,
        webhookUrl: false,
        mediaStreamUrl: false,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTelnyxStatus()
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
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Checking Telnyx configuration...
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
              Telnyx Configuration Status
            </CardTitle>
            <CardDescription>
              Check if Telnyx is properly configured for making calls
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkTelnyxStatus} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.apiKey)}
              <span className="text-sm">TELNYX_API_KEY</span>
            </div>
            {getStatusBadge(status.apiKey)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.connectionId)}
              <span className="text-sm">TELNYX_CONNECTION_ID</span>
            </div>
            {getStatusBadge(status.connectionId)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.fromNumber)}
              <span className="text-sm">TELNYX_FROM_NUMBER</span>
            </div>
            {getStatusBadge(status.fromNumber)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.webhookUrl)}
              <span className="text-sm">TELNYX_WEBHOOK_BASE_URL</span>
            </div>
            {getStatusBadge(status.webhookUrl)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.mediaStreamUrl)}
              <span className="text-sm">TELNYX_MEDIA_STREAM_URL</span>
            </div>
            {getStatusBadge(status.mediaStreamUrl)}
          </div>
        </div>

        {!status.configured && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              <strong>Setup Required:</strong> Please configure the missing Telnyx environment
              variables in your .env file to enable calling functionality.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
