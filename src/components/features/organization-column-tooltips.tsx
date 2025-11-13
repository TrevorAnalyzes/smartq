'use client'

import { useOrganizationAgents } from '@/hooks/use-agents'
import { useUsers } from '@/hooks/use-users'
import { useOrganizationConversations } from '@/hooks/use-conversations'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, Users, MessageSquare } from 'lucide-react'

interface AgentsTooltipProps {
  organizationId: string
  count: number
  children: React.ReactNode
}

export function AgentsTooltip({ organizationId, count, children }: AgentsTooltipProps) {
  const { data: agents, isLoading } = useOrganizationAgents(organizationId)
  const previewAgents = agents?.slice(0, 5) || []

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      inactive: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      maintenance: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    }
    return statusConfig[status.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="w-80 p-3">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Bot className="h-4 w-4" />
              <span>Voice Agents ({count})</span>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full bg-white/10" />
                ))}
              </div>
            ) : previewAgents.length > 0 ? (
              <div className="space-y-2">
                {previewAgents.map((agent: any) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="truncate flex-1 font-medium">{agent.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ml-2 ${getStatusBadge(agent.status)}`}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                ))}
                {count > 5 && (
                  <p className="text-xs text-white/60 pt-1 px-2">
                    +{count - 5} more agents
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60 py-2">No agents yet</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface TeamMembersTooltipProps {
  organizationId: string
  count: number
  children: React.ReactNode
}

export function TeamMembersTooltip({ organizationId, count, children }: TeamMembersTooltipProps) {
  const { data: usersData, isLoading } = useUsers(organizationId)
  const users = usersData?.users || []
  const previewUsers = users.slice(0, 5)

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, string> = {
      admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      agent: 'bg-green-500/20 text-green-300 border-green-500/30',
      viewer: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
    return roleConfig[role.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="w-80 p-3">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Users className="h-4 w-4" />
              <span>Team Members ({count})</span>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full bg-white/10" />
                ))}
              </div>
            ) : previewUsers.length > 0 ? (
              <div className="space-y-2">
                {previewUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="truncate flex-1 font-medium">{user.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ml-2 capitalize ${getRoleBadge(user.role)}`}
                    >
                      {user.role}
                    </Badge>
                  </div>
                ))}
                {count > 5 && (
                  <p className="text-xs text-white/60 pt-1 px-2">
                    +{count - 5} more members
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60 py-2">No team members yet</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ConversationsTooltipProps {
  organizationId: string
  count: number
  children: React.ReactNode
}

export function ConversationsTooltip({ organizationId, count, children }: ConversationsTooltipProps) {
  const { data, isLoading } = useOrganizationConversations(organizationId, { limit: 5 })
  const conversations = data?.conversations || []

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      connected: 'bg-green-500/20 text-green-300 border-green-500/30',
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      ended: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30',
      missed: 'bg-red-500/20 text-red-300 border-red-500/30',
      queued: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    }
    return statusConfig[status.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="w-80 p-3">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <MessageSquare className="h-4 w-4" />
              <span>Recent Conversations ({count})</span>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full bg-white/10" />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conv: any) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="truncate flex-1 font-medium">
                      {conv.customerName || 'Unknown'} <span className="text-white/60">•</span> {conv.agentName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ml-2 capitalize ${getStatusBadge(conv.status)}`}
                    >
                      {conv.status}
                    </Badge>
                  </div>
                ))}
                {count > 5 && (
                  <p className="text-xs text-white/60 pt-1 px-2">
                    +{count - 5} more conversations
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60 py-2">No conversations yet</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

