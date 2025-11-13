import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'

interface DashboardMetricsProps {
  organizationId?: string
}

export function DashboardMetrics({ organizationId }: DashboardMetricsProps = {}) {
  const { data: metrics, isLoading: loading } = useDashboardMetrics(organizationId)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="bg-muted h-4 w-3/4 rounded"></div>
              <div className="bg-muted h-3 w-1/2 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-1/2 rounded"></div>
              <div className="bg-muted h-3 w-3/4 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          <Badge variant="secondary">Live</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeAgents}</div>
          <p className="text-muted-foreground text-xs">British accent enabled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <Badge variant="outline">Today</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalCalls.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">Phone system active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Badge variant="default">Excellent</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.successRate}%</div>
          <p className="text-muted-foreground text-xs">CRM integration active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
          <Badge variant="secondary" className="bg-brand-secondary text-white">
            £
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">£{metrics.revenueGenerated.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">UK business growth</p>
        </CardContent>
      </Card>
    </div>
  )
}
