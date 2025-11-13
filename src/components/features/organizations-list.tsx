'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizations, useDeleteOrganization } from '@/hooks/use-organizations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, MoreHorizontal, Plus, Users, Bot, MessageSquare, Trash2, Settings } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganizationStore } from '@/store/organization-store'
import { CreateOrganizationDialog } from './create-organization-dialog'
import { toast } from 'sonner'
import { AgentsDetailSheet } from './agents-detail-sheet'
import { TeamMembersDetailSheet } from './team-members-detail-sheet'
import { ConversationsDetailSheet } from './conversations-detail-sheet'
import { AgentsTooltip, TeamMembersTooltip, ConversationsTooltip } from './organization-column-tooltips'

export function OrganizationsList() {
  const router = useRouter()
  const { data, isLoading } = useOrganizations()
  const deleteOrganization = useDeleteOrganization()
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // State for detail sheets
  const [agentsSheetOpen, setAgentsSheetOpen] = useState(false)
  const [teamSheetOpen, setTeamSheetOpen] = useState(false)
  const [conversationsSheetOpen, setConversationsSheetOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<any>(null)

  const organizations = data?.organizations || []

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ENTERPRISE: { variant: 'default', label: 'Enterprise' },
      PRO: { variant: 'secondary', label: 'Pro' },
      FREE: { variant: 'outline', label: 'Free' },
      enterprise: { variant: 'default', label: 'Enterprise' },
      pro: { variant: 'secondary', label: 'Pro' },
      free: { variant: 'outline', label: 'Free' },
    }
    const config = variants[plan] || variants.FREE
    return <Badge variant={config?.variant}>{config?.label}</Badge>
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteOrganization.mutateAsync(id)
        toast.success(`Organization "${name}" deleted successfully`)
      } catch (error) {
        console.error('Failed to delete organization:', error)
        toast.error('Failed to delete organization. Please try again.')
      }
    }
  }

  const handleOpenAgentsSheet = (org: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOrg(org)
    setAgentsSheetOpen(true)
  }

  const handleOpenTeamSheet = (org: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOrg(org)
    setTeamSheetOpen(true)
  }

  const handleOpenConversationsSheet = (org: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOrg(org)
    setConversationsSheetOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Organizations</CardTitle>
              <CardDescription>
                Manage and switch between your organizations
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first organization
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org: any) => {
                  const isCurrentOrg = currentOrganization?.id === org.id
                  return (
                    <TableRow
                      key={org.id}
                      className={`transition-colors ${isCurrentOrg ? 'bg-muted/30' : ''}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isCurrentOrg ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                            }`}
                          >
                            <Building2 className={`h-5 w-5 ${isCurrentOrg ? '' : 'text-primary'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{org.name}</p>
                              {isCurrentOrg && (
                                <Badge variant="default" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{org.domain}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(org.plan)}</TableCell>
                      <TableCell onClick={(e) => handleOpenTeamSheet(org, e)}>
                        <TeamMembersTooltip organizationId={org.id} count={org._count?.users || 0}>
                          <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{org._count?.users || 0}</span>
                          </div>
                        </TeamMembersTooltip>
                      </TableCell>
                      <TableCell onClick={(e) => handleOpenAgentsSheet(org, e)}>
                        <AgentsTooltip organizationId={org.id} count={org._count?.voiceAgents || 0}>
                          <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{org._count?.voiceAgents || 0}</span>
                          </div>
                        </AgentsTooltip>
                      </TableCell>
                      <TableCell onClick={(e) => handleOpenConversationsSheet(org, e)}>
                        <ConversationsTooltip organizationId={org.id} count={org._count?.conversations || 0}>
                          <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{org._count?.conversations || 0}</span>
                          </div>
                        </ConversationsTooltip>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/organizations?tab=settings')}>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(org.id, org.name)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateOrganizationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Detail Sheets */}
      {selectedOrg && (
        <>
          <AgentsDetailSheet
            organizationId={selectedOrg.id}
            organizationName={selectedOrg.name}
            open={agentsSheetOpen}
            onOpenChange={setAgentsSheetOpen}
          />
          <TeamMembersDetailSheet
            organizationId={selectedOrg.id}
            organizationName={selectedOrg.name}
            open={teamSheetOpen}
            onOpenChange={setTeamSheetOpen}
          />
          <ConversationsDetailSheet
            organizationId={selectedOrg.id}
            organizationName={selectedOrg.name}
            open={conversationsSheetOpen}
            onOpenChange={setConversationsSheetOpen}
          />
        </>
      )}
    </>
  )
}

