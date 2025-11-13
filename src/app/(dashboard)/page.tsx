'use client'

import { DashboardMetrics } from '@/components/features/dashboard-metrics'
import { RecentActivity } from '@/components/features/recent-activity'
import { PerformanceChart } from '@/components/features/performance-chart'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardMetrics />

      <PerformanceChart />

      <RecentActivity />
    </div>
  )
}
