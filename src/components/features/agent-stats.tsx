'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Play, Pause, Wrench, TrendingUp, Clock, Phone, CheckCircle } from 'lucide-react'
import { useAgents } from '@/hooks/use-agents'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'

export function AgentStats() {
  const { data: agents = [], isLoading: agentsLoading } = useAgents()
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()

  const isLoading = agentsLoading || metricsLoading

  const activeAgents = agents.filter(a => a.status === 'active').length
  const inactiveAgents = agents.filter(a => a.status === 'inactive').length
  const maintenanceAgents = agents.filter(a => a.status === 'maintenance').length

  const agentStats = [
    {
      title: 'Active Agents',
      value: activeAgents,
      icon: Play,
      bgColor: 'bg-green-100',
      color: 'text-green-600',
      change: `${agents.length} total agents`,
    },
    {
      title: 'Inactive',
      value: inactiveAgents,
      icon: Pause,
      bgColor: 'bg-gray-100',
      color: 'text-gray-600',
      change: 'Ready to activate',
    },
    {
      title: 'Maintenance',
      value: maintenanceAgents,
      icon: Wrench,
      bgColor: 'bg-yellow-100',
      color: 'text-yellow-600',
      change: 'Under maintenance',
    },
    {
      title: 'Total Agents',
      value: agents.length,
      icon: Bot,
      bgColor: 'bg-blue-100',
      color: 'text-blue-600',
      change: 'All voice agents',
    },
  ]

  const performanceStats = [
    {
      title: 'Total Calls',
      value: metrics?.totalCalls || 0,
      icon: Phone,
      trend: 'up',
      change: 'Today',
    },
    {
      title: 'Avg Duration',
      value: metrics?.avgDuration ? `${Math.floor(metrics.avgDuration / 60)}m` : '0m',
      icon: Clock,
      trend: 'up',
      change: 'Per call',
    },
    {
      title: 'Success Rate',
      value: `${metrics?.successRate || 0}%`,
      icon: CheckCircle,
      trend: 'up',
      change: 'Overall',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="flex h-24 items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {agentStats.map(stat => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-muted-foreground mt-1 text-xs">{stat.change}</p>
          </CardContent>
        </Card>
      ))}

      {performanceStats.map(stat => (
        <Card key={stat.title} className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 flex items-center gap-1">
              <TrendingUp
                className={`h-3 w-3 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
              />
              <p className="text-muted-foreground text-xs">{stat.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
