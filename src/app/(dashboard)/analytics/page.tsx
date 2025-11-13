'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalytics } from '@/hooks/use-analytics'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'
import { AnalyticsSummary } from '@/components/features/analytics-summary'
import { SentimentDistributionChart } from '@/components/charts/sentiment-distribution-chart'
import { StatusDistributionChart } from '@/components/charts/status-distribution-chart'
import { HourlyDistributionChart } from '@/components/charts/hourly-distribution-chart'
import { AgentPerformanceChart } from '@/components/charts/agent-performance-chart'
import { Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7)
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics({ days: timeRange })
  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics()

  const isLoading = analyticsLoading || metricsLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for conversation logs, performance metrics, and business insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            <Button
              variant={timeRange === 7 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(7)}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === 30 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(30)}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === 90 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(90)}
            >
              90 Days
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-40 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnalyticsSummary
          totalConversations={analyticsData?.summary.totalConversations || 0}
          trend={analyticsData?.summary.trend || 0}
          averageDuration={metricsData?.averageCallDuration}
          successRate={metricsData?.successRate}
          satisfactionRate={metricsData?.customerSatisfaction}
        />
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sentiment Distribution */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <SentimentDistributionChart
            data={analyticsData?.sentimentDistribution || []}
          />
        )}

        {/* Status Distribution */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <StatusDistributionChart data={analyticsData?.statusDistribution || []} />
        )}
      </div>

      {/* Hourly Distribution - Full Width */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <HourlyDistributionChart data={analyticsData?.hourlyDistribution || []} />
      )}

      {/* Agent Performance - Full Width */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <AgentPerformanceChart data={analyticsData?.performanceByAgent || []} />
      )}
    </div>
  )
}
