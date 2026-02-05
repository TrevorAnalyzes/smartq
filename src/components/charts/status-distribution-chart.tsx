'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface StatusDistributionChartProps {
  data: Array<{
    status: string
    count: number
  }>
}

const COLORS = {
  connected: '#22c55e', // green-500
  active: '#22c55e', // green-500
  ended: '#94a3b8', // slate-400
  failed: '#ef4444', // red-500
  missed: '#ef4444', // red-500
  queued: '#3b82f6', // blue-500
  ringing: '#f59e0b', // amber-500
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    count: item.count,
    status: item.status,
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Status Distribution</CardTitle>
        <CardDescription>Breakdown of conversation statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">
            No status data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status as keyof typeof COLORS] || '#64748b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
