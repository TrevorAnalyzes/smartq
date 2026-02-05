'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SentimentDistributionChartProps {
  data: Array<{
    sentiment: string
    count: number
  }>
}

const COLORS = {
  positive: '#22c55e', // green-500
  neutral: '#94a3b8', // slate-400
  negative: '#ef4444', // red-500
  unknown: '#64748b', // slate-500
}

export function SentimentDistributionChart({ data }: SentimentDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
    value: item.count,
    sentiment: item.sentiment,
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>Customer sentiment analysis across all conversations</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">
            No sentiment data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.sentiment as keyof typeof COLORS] || COLORS.unknown}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
