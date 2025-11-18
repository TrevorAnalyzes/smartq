'use client'

import { useUsers } from '@/hooks/use-users'
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
import { Users, Mail, Shield, Clock } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface TeamMembersDetailSheetProps {
  organizationId: string
  organizationName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamMembersDetailSheet({
  organizationId,
  organizationName,
  open,
  onOpenChange,
}: TeamMembersDetailSheetProps) {
  const { data: usersData, isLoading } = useUsers(organizationId)
  const users = usersData?.users || []

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: 'default',
      manager: 'secondary',
      agent: 'outline',
      viewer: 'outline',
    }
    return (
      <Badge variant={variants[role] || 'outline'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </SheetTitle>
          <SheetDescription>All team members for {organizationName}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user: any, index: number) => (
                <div key={user.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <div className="mt-1 flex items-center gap-2">
                            {getRoleBadge(user.role)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-sm">
                        <div className="text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{user.email}</span>
                        </div>
                        {user.permissions && user.permissions.length > 0 && (
                          <div className="text-muted-foreground flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5" />
                            <span>{user.permissions.length} permissions</span>
                          </div>
                        )}
                        <div className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-muted-foreground text-xs">
                            Last login: {new Date(user.lastLoginAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No team members</h3>
              <p className="text-muted-foreground text-sm">
                This organization doesn't have any team members yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
