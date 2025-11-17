'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Phone, Clock, Volume2, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useConversations } from '@/hooks/use-conversations'

const getSentimentBadge = (sentiment?: string) => {
  switch (sentiment) {
    case 'positive':
      return <Badge className="bg-green-100 text-green-800">Positive</Badge>
    case 'negative':
      return <Badge className="bg-red-100 text-red-800">Negative</Badge>
    default:
      return <Badge variant="secondary">Neutral</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'connected':
      return <Badge className="animate-pulse bg-green-100 text-green-800">Live</Badge>
    case 'ringing':
      return <Badge className="animate-pulse bg-blue-100 text-blue-800">Ringing</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function LiveConversations() {
  // Fetch only active/ringing conversations
  const { data, isLoading } = useConversations({
    status: 'connected',
    limit: 10,
  })

  const conversations = data?.conversations || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="text-brand-primary h-5 w-5" />
                Live Conversations
              </CardTitle>
              <CardDescription>Monitor ongoing calls in real-time</CardDescription>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              Loading...
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card animate-pulse rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-muted h-8 w-8 rounded-full"></div>
                <div className="space-y-2">
                  <div className="bg-muted h-4 w-24 rounded"></div>
                  <div className="bg-muted h-3 w-20 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-muted h-3 w-32 rounded"></div>
                <div className="bg-muted h-3 w-40 rounded"></div>
              </div>
            </div>
          ))}
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
              <Phone className="text-brand-primary h-5 w-5" />
              Live Conversations
            </CardTitle>
            <CardDescription>Monitor ongoing calls in real-time</CardDescription>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            {conversations.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversations.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p>No active conversations at the moment</p>
          </div>
        ) : (
          conversations.map(conversation => (
          <div
            key={conversation.id}
            className="bg-card hover:bg-accent/50 rounded-lg border p-4 transition-colors"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {(conversation as any).agentName?.slice(0, 2).toUpperCase() || 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{(conversation as any).agentName || 'AI Assistant'}</p>
                  <p className="text-muted-foreground text-xs">AI Assistant</p>
                </div>
              </div>
              {getStatusBadge(conversation.status)}
            </div>

            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{conversation.customerName || 'Customer'}</span>
                {getSentimentBadge(conversation.sentiment || undefined)}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3" />
                {conversation.customerPhone}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(conversation.startedAt), { addSuffix: true })}
              </div>
            </div>

            {conversation.topic && (
              <div className="mb-3">
                <Badge variant="outline" className="mb-2 text-xs">
                  {conversation.topic}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="mr-1 h-3 w-3" />
                Monitor
              </Button>
              <Button variant="ghost" size="sm">
                <Volume2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  )
}
