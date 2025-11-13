'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, TrendingUp, TrendingDown, Clock, ThumbsUp } from 'lucide-react'

interface AnalyticsSummaryProps {
  totalConversations: number
  trend: number
  averageDuration?: number
  successRate?: number
  satisfactionRate?: number
}

export function AnalyticsSummary({
  totalConversations,
  trend,
  averageDuration,
  successRate,
  satisfactionRate,
}: AnalyticsSummaryProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Conversations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
          <div className="flex items-center gap-2 mt-1">
            {trend > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500">+{trend.toFixed(1)}%</span>
              </>
            ) : trend < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500">{trend.toFixed(1)}%</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No change</span>
            )}
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Duration */}
      {averageDuration !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(averageDuration)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average across all calls</p>
          </CardContent>
        </Card>
      )}

      {/* Success Rate */}
      {successRate !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Completed successfully</p>
          </CardContent>
        </Card>
      )}

      {/* Customer Satisfaction */}
      {satisfactionRate !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfactionRate.toFixed(1)}%</div>
            <div className="mt-1">
              {satisfactionRate >= 80 ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
              ) : satisfactionRate >= 60 ? (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Needs Improvement
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

