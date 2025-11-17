'use client'

import { useState } from 'react'
import { Bell, Bot, AlertCircle, CheckCircle, XCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { useActivities } from '@/hooks/use-activities'
import { useAgents } from '@/hooks/use-agents'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'call_completed' | 'call_failed' | 'agent_status' | 'system_alert'
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon: React.ReactNode
  variant: 'success' | 'error' | 'warning' | 'info'
}

export function NotificationsPanel() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: activitiesData } = useActivities(undefined, { limit: 10 })
  const { data: agents = [] } = useAgents()

  // Generate notifications from activities and agent status
  const notifications: Notification[] = []

  // Add activity-based notifications
  if (activitiesData?.activities) {
    activitiesData.activities.slice(0, 5).forEach((activity) => {
      if (activity.status === 'completed') {
        notifications.push({
          id: activity.id,
          type: 'call_completed',
          title: 'Call Completed',
          message: `${activity.agentName || 'Agent'} completed call with ${activity.customerName || 'customer'}`,
          timestamp: new Date(activity.timestamp),
          read: false,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          variant: 'success',
        })
      } else if (activity.status === 'failed') {
        notifications.push({
          id: activity.id,
          type: 'call_failed',
          title: 'Call Failed',
          message: `Call with ${activity.customerName || 'customer'} failed`,
          timestamp: new Date(activity.timestamp),
          read: false,
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          variant: 'error',
        })
      }
    })
  }

  // Add agent status notifications
  const inactiveAgents = agents.filter((agent) => agent.status === 'INACTIVE')
  if (inactiveAgents.length > 0 && notifications.length < 8) {
    inactiveAgents.slice(0, 2).forEach((agent) => {
      notifications.push({
        id: `agent-${agent.id}`,
        type: 'agent_status',
        title: 'Agent Offline',
        message: `${agent.name} is currently inactive`,
        timestamp: new Date(agent.updatedAt || new Date()),
        read: false,
        icon: <Bot className="h-4 w-4 text-orange-600" />,
        variant: 'warning',
      })
    })
  }

  // Add system alert if there are many failed calls
  const failedCalls = activitiesData?.activities.filter((a) => a.status === 'failed') || []
  if (failedCalls.length >= 3 && notifications.length < 10) {
    notifications.push({
      id: 'system-alert-failed-calls',
      type: 'system_alert',
      title: 'High Failure Rate',
      message: `${failedCalls.length} calls failed in the last hour`,
      timestamp: new Date(),
      read: false,
      icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      variant: 'error',
    })
  }

  // Sort by timestamp (newest first)
  notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notification: Notification) => {
    // Navigate based on notification type
    if (notification.type === 'call_completed' || notification.type === 'call_failed') {
      router.push('/conversations')
    } else if (notification.type === 'agent_status') {
      router.push('/agents')
    }
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="bg-brand-accent absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              router.push('/settings')
              setOpen(false)
            }}
          >
            <Settings className="mr-1 h-3 w-3" />
            Settings
          </Button>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="hover:bg-accent w-full rounded-lg p-3 text-left transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">{notification.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.read && (
                          <div className="bg-brand-accent h-2 w-2 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-muted-foreground mb-1 text-xs">{notification.message}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

