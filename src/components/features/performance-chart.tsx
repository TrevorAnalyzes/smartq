'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { useAnalytics } from '@/hooks/use-analytics'

interface PerformanceChartProps {
  organizationId?: string
}

export function PerformanceChart({ organizationId }: PerformanceChartProps = {}) {
  const { data: analyticsData, isLoading } = useAnalytics({ days: 7, organizationId })

  const performanceData = analyticsData?.dailyStats || []

  const todayStats = performanceData[performanceData.length - 1]
  const totalCallsToday = todayStats?.totalCalls ?? 0
  const successfulCallsToday = todayStats?.successfulCalls ?? 0
  const successRateToday = todayStats?.successRate ?? 0


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Real-time call volume and success rates for today</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Loading performance data...</p>
          </div>
        ) : performanceData.length === 0 ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        ) : (
          <>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004225" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#004225" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="fill-muted-foreground text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis className="fill-muted-foreground text-xs" axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background rounded-lg border p-3 shadow-md">
                        <p className="font-medium">{`Date: ${label}`}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="totalCalls"
                stroke="#0066CC"
                strokeWidth={2}
                fill="url(#callsGradient)"
                name="Total Calls"
              />
              <Area
                type="monotone"
                dataKey="successfulCalls"
                stroke="#004225"
                strokeWidth={2}
                fill="url(#successGradient)"
                name="Successful Calls"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-brand-primary text-2xl font-bold">
              {totalCallsToday.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-xs">Total Calls Today</p>
          </div>
          <div>
            <p className="text-brand-secondary text-2xl font-bold">
              {successfulCallsToday.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-xs">Successful Calls</p>
          </div>
          <div>
            <p className="text-brand-accent text-2xl font-bold">
              {`${successRateToday.toFixed(1)}%`}
            </p>
            <p className="text-muted-foreground text-xs">Success Rate</p>
          </div>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
