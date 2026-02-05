'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Bot, MessageSquare, Building2, Settings, Home, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavigationItem } from '@/lib/types'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

const navigationItems: NavigationItem[] = [
  {
    title: 'Overview',
    url: '/',
    icon: Home,
    badge: null,
  },
  {
    title: 'Assistants',
    url: '/agents',
    icon: Bot,
    badge: null,
  },
  {
    title: 'Conversations',
    url: '/conversations',
    icon: MessageSquare,
    badge: null,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    title: 'Organizations',
    url: '/organizations',
    icon: Building2,
    badge: null,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { toggleSidebar, state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="bg-sidebar border-r">
      <SidebarHeader className="border-sidebar-border border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 py-1">
              <button
                onClick={toggleSidebar}
                className="hover:bg-sidebar-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                aria-label="Toggle Sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {state === 'expanded' && (
                <span className="text-sidebar-foreground text-lg font-bold tracking-tight">
                  SmartQ
                </span>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      'w-full justify-start',
                      pathname === item.url && 'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant={item.badge.variant} className="ml-auto text-xs">
                          {item.badge.text}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
