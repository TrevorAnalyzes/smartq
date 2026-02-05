'use client'

import { usePathname } from 'next/navigation'
import { User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useOrganizationStore } from '@/store/organization-store'
import { GlobalSearch } from '@/components/features/global-search'
import { NotificationsPanel } from '@/components/features/notifications-panel'

const getPageTitle = (pathname: string, organizationName?: string) => {
  // Check if we're on an organization-specific dashboard
  if (pathname.includes('/organizations/') && pathname.endsWith('/dashboard')) {
    return organizationName || 'Organization Dashboard'
  }

  const routes: Record<string, string> = {
    '/': 'Overview',
    '/agents': 'Assistant Management',
    '/conversations': 'Conversation Logs',
    '/analytics': 'Analytics & Reporting',
    '/organizations': 'Organization Management',
    '/settings': 'Settings & Configuration',
  }
  return routes[pathname] || 'Dashboard'
}

export function DashboardHeader() {
  const pathname = usePathname()
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const pageTitle = getPageTitle(pathname, currentOrganization?.name)

  // Check if we're on an organization-specific page
  const isOrgSpecificPage = pathname.includes('/organizations/') && pathname.split('/').length > 2

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default'
      case 'pro':
        return 'secondary'
      case 'free':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <header className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 z-50 w-full border-b">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Page Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          {currentOrganization && isOrgSpecificPage && (
            <Badge variant={getPlanBadgeVariant(currentOrganization.plan)} className="text-xs">
              {currentOrganization.plan.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <GlobalSearch />

          <NotificationsPanel />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sidebar-foreground hover:bg-sidebar-accent/60 flex items-center gap-2 px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-muted-foreground text-xs">Admin</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
