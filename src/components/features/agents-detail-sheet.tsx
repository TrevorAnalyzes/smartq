'use client'

import { useOrganizationAgents } from '@/hooks/use-agents'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Phone, Activity } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface AgentsDetailSheetProps {
  organizationId: string
  organizationName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentsDetailSheet({
  organizationId,
  organizationName,
  open,
  onOpenChange,
}: AgentsDetailSheetProps) {
  const { data: agents, isLoading } = useOrganizationAgents(organizationId)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      inactive: 'secondary',
      training: 'outline',
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Voice Agents
          </SheetTitle>
          <SheetDescription>All voice agents for {organizationName}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : agents && agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent: any, index: number) => (
                <div key={agent.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="flex items-center gap-2 font-semibold">
                          {agent.name}
                          {getStatusBadge(agent.status)}
                        </h4>
                        {agent.description && (
                          <p className="text-muted-foreground text-sm">{agent.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{agent.phoneNumber || 'No number'}</span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span>{agent.totalCalls || 0} calls</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {agent.accentType?.replace(/-/g, ' ').toUpperCase() || 'Default'}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        Created {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No voice agents</h3>
              <p className="text-muted-foreground text-sm">
                This organization hasn't created any voice agents yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
