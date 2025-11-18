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
  Legend,
} from 'recharts'

interface AgentPerformanceChartProps {
  data: Array<{
    agentId: string
    agentName: string
    averageDuration: number
    totalCalls: number
  }>
}

export function AgentPerformanceChart({ data }: AgentPerformanceChartProps) {
  const chartData = data.map(item => ({
    name: item.agentName,
    'Avg Duration (min)': Math.round(item.averageDuration / 60),
    'Total Calls': item.totalCalls,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance</CardTitle>
        <CardDescription>Average call duration and total calls per agent</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">
            No agent performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="Avg Duration (min)"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
              />
              <Bar yAxisId="right" dataKey="Total Calls" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
