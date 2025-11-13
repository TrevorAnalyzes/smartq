import { ReactNode } from 'react'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { SidebarProvider } from '@/components/ui/sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="bg-background flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="bg-muted/10 flex-1 overflow-y-auto">
            <div className="container mx-auto space-y-6 p-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
