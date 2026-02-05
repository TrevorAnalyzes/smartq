'use client'

import { useState } from 'react'
import { useUsers, useDeleteUser } from '@/hooks/use-users'
import { useOrganizationStore } from '@/store/organization-store'
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
import { UserPlus, MoreHorizontal, Mail, Shield, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { InviteUserDialog } from './invite-user-dialog'
import { formatDistanceToNow } from 'date-fns'

export function TeamManagement() {
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const { data, isLoading } = useUsers(currentOrganization?.id)
  const deleteUser = useDeleteUser()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const users = data?.users || []

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ADMIN: { variant: 'default', label: 'Admin' },
      MANAGER: { variant: 'secondary', label: 'Manager' },
      AGENT: { variant: 'outline', label: 'Agent' },
      VIEWER: { variant: 'outline', label: 'Viewer' },
      admin: { variant: 'default', label: 'Admin' },
      manager: { variant: 'secondary', label: 'Manager' },
      agent: { variant: 'outline', label: 'Agent' },
      viewer: { variant: 'outline', label: 'Viewer' },
    }
    const config = variants[role] || variants.VIEWER
    return <Badge variant={config?.variant}>{config?.label}</Badge>
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the team?`)) {
      try {
        await deleteUser.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Failed to remove user. Please try again.')
      }
    }
  }

  if (!currentOrganization) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Please select an organization first</p>
          </div>
        </CardContent>
      </Card>
    )
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
            {[1, 2, 3].map(i => (
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
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team members for {currentOrganization.name}</CardDescription>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserPlus className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No team members yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Invite your first team member to get started
              </p>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                          <span className="text-primary text-sm font-medium">
                            {user.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Shield className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          {user.permissions.length} permissions
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {user.lastLoginAt
                          ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                          : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        organizationId={currentOrganization.id}
      />
    </>
  )
}
