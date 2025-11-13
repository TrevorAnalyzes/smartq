'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, Clock, MessageSquare, CheckCircle, XCircle, PhoneCall } from 'lucide-react'
import { useConversations } from '@/hooks/use-conversations'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'

export function ConversationStats() {
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations({ limit: 100 })
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()

  const isLoading = conversationsLoading || metricsLoading
  const conversations = conversationsData?.conversations || []

  const totalConversations = conversations.length
  const activeConversations = conversations.filter(c => c.status === 'CONNECTED').length
  const completedConversations = conversations.filter(c => c.status === 'ENDED').length
  const avgDuration = metrics?.avgDuration || metrics?.averageCallDuration || 0

  const conversationStats = [
    {
      title: 'Total Conversations',
      value: totalConversations,
      icon: MessageSquare,
      bgColor: 'bg-blue-100',
      color: 'text-blue-600',
      change: 'All time',
      badge: null,
    },
    {
      title: 'Active Now',
      value: activeConversations,
      icon: PhoneCall,
      bgColor: 'bg-green-100',
      color: 'text-green-600',
      change: 'Live conversations',
      badge: { variant: 'default' as const, text: 'Live' },
    },
    {
      title: 'Completed',
      value: completedConversations,
      icon: CheckCircle,
      bgColor: 'bg-purple-100',
      color: 'text-purple-600',
      change: 'Successfully ended',
      badge: null,
    },
    {
      title: 'Avg Duration',
      value: avgDuration ? `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s` : '0m',
      icon: Clock,
      bgColor: 'bg-orange-100',
      color: 'text-orange-600',
      change: 'Per conversation',
      badge: null,
    },
  ]

  const successfulCalls = conversations.filter(c => c.outcome === 'successful').length
  const failedCalls = conversations.filter(c => c.outcome === 'failed').length
  const noAnswerCalls = conversations.filter(c => c.outcome === 'no-answer').length
  const voicemailCalls = conversations.filter(c => c.outcome === 'voicemail').length

  const callOutcomes = [
    {
      label: 'Successful',
      count: successfulCalls,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Failed',
      count: failedCalls,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'No Answer',
      count: noAnswerCalls,
      icon: Phone,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Voicemail',
      count: voicemailCalls,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="flex h-24 items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {conversationStats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="flex items-center gap-2">
                {stat.badge && (
                  <Badge variant={stat.badge.variant} className="text-xs">
                    {stat.badge.text}
                  </Badge>
                )}
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground mt-1 text-xs">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {callOutcomes.map(outcome => (
              <div
                key={outcome.label}
                className="bg-card flex items-center gap-3 rounded-lg border p-3"
              >
                <div className={`rounded-lg p-2 ${outcome.bgColor}`}>
                  <outcome.icon className={`h-5 w-5 ${outcome.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{outcome.label}</p>
                  <div className="mt-1">
                    <span className="text-lg font-bold">{outcome.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
