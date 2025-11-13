'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Clock, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useActivities } from '@/hooks/use-activities'

interface RecentActivityProps {
  organizationId?: string
}

const getStatusIcon = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'ended':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'connected':
    case 'ringing':
      return <Phone className="h-4 w-4 animate-pulse text-blue-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

export function RecentActivity({ organizationId }: RecentActivityProps = {}) {
  const { data, isLoading } = useActivities(organizationId)
  const activities = data?.activities || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest conversation activities and outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="bg-card flex animate-pulse items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted h-8 w-8 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="bg-muted h-4 w-32 rounded"></div>
                    <div className="bg-muted h-3 w-24 rounded"></div>
                  </div>
                </div>
                <div className="bg-muted h-6 w-16 rounded"></div>
              </div>
            ))}
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest voice agent interactions and call outcomes</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No recent activities</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-card hover:bg-accent/50 flex items-center gap-4 rounded-lg border p-3 transition-colors"
                >
                  <div className="flex-shrink-0">{getStatusIcon(activity.status)}</div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {activity.agentName && `${activity.agentName} - `}
                        {activity.customerName || 'Unknown Customer'}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.duration && <span>Duration: {activity.duration}</span>}
                      {activity.outcome && <span>Outcome: {activity.outcome}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {activities.length} recent activities
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
