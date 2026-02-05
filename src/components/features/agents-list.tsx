'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Trash2,
  Phone,
  TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAgents } from '@/hooks/use-agents'
import { VoiceAgentWithCount } from '@/lib/types'
import { CallDialog } from './call-dialog'

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>
    case 'maintenance':
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
          Maintenance
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function AgentsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: agents = [], isLoading } = useAgents()

  const filteredAgents = agents.filter(
    agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.accentType && agent.accentType.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assistants</CardTitle>
            <CardDescription>
              Manage and monitor your AI assistants with British accents
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading assistants...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accent</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Calls</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <p className="text-muted-foreground">
                      No agents found. Create your first agent to get started.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {agent.description || 'AI Assistant'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-brand-secondary border-brand-secondary"
                      >
                        {agent.accentType
                          ?.replace(/-/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase()) || 'British RP'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {agent.phoneNumber || 'Not set'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="text-muted-foreground h-3 w-3" />
                        {(agent as VoiceAgentWithCount)._count?.conversations || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(agent.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <CallDialog agentId={agent.id} agentName={agent.name}>
                        <Button variant="outline" size="sm">
                          <Phone className="mr-2 h-4 w-4" />
                          Test Call
                        </Button>
                      </CallDialog>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <CallDialog agentId={agent.id} agentName={agent.name}>
                            <DropdownMenuItem onSelect={e => e.preventDefault()}>
                              <Phone className="mr-2 h-4 w-4" />
                              Test Call
                            </DropdownMenuItem>
                          </CallDialog>
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Start Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
