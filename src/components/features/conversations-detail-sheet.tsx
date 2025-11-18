'use client'

import { useOrganizationConversations } from '@/hooks/use-conversations'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Bot, Clock, Phone, TrendingUp } from 'lucide-react'

interface ConversationsDetailSheetProps {
  organizationId: string
  organizationName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConversationsDetailSheet({
  organizationId,
  organizationName,
  open,
  onOpenChange,
}: ConversationsDetailSheetProps) {
  const { data, isLoading } = useOrganizationConversations(organizationId, { limit: 50 })
  const conversations = data?.conversations || []

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; className: string }> = {
      connected: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
      active: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
      ended: { variant: 'secondary', className: 'bg-gray-100 text-gray-700 border-gray-200' },
      failed: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
      missed: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
      queued: { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    }
    const config = statusConfig[status.toLowerCase()] || { variant: 'outline', className: '' }
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null
    const sentimentConfig: Record<string, { variant: any; className: string }> = {
      positive: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
      neutral: { variant: 'secondary', className: 'bg-gray-100 text-gray-700 border-gray-200' },
      negative: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
    }
    const config = sentimentConfig[sentiment.toLowerCase()] || { variant: 'outline', className: '' }
    return (
      <Badge variant={config.variant} className={config.className}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </Badge>
    )
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </SheetTitle>
          <SheetDescription>All conversations for {organizationName}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conv: any) => (
                <div
                  key={conv.id}
                  className="bg-card hover:bg-accent/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header: Customer name and badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="truncate text-base font-semibold">
                          {conv.customerName || 'Unknown Customer'}
                        </h4>
                        {conv.topic && (
                          <p className="text-muted-foreground truncate text-sm">{conv.topic}</p>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        {getStatusBadge(conv.status)}
                        {conv.sentiment && getSentimentBadge(conv.sentiment)}
                      </div>
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-sm">
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{conv.customerPhone || 'No number'}</span>
                      </div>
                      <div className="text-foreground flex items-center gap-2 font-medium">
                        <Bot className="text-brand-primary h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{conv.agentName}</span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{formatDuration(conv.duration)}</span>
                      </div>
                      {conv.outcome && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                          <span className="font-medium text-green-700 capitalize">
                            {conv.outcome}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-muted-foreground border-t pt-1 text-xs">
                      Started{' '}
                      {new Date(conv.startedAt).toLocaleString('en-GB', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                      {conv.endedAt &&
                        ` • Ended ${new Date(conv.endedAt).toLocaleString('en-GB', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No conversations</h3>
              <p className="text-muted-foreground text-sm">
                This organization hasn't had any conversations yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
