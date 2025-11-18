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
import { Search, MoreHorizontal, Play, Download, Eye, Phone, Clock, Filter } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { useConversations } from '@/hooks/use-conversations'

const getSentimentBadge = (sentiment?: string) => {
  switch (sentiment) {
    case 'positive':
      return <Badge className="bg-green-100 text-green-800">Positive</Badge>
    case 'negative':
      return <Badge className="bg-red-100 text-red-800">Negative</Badge>
    default:
      return <Badge variant="secondary">Neutral</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function ConversationHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading } = useConversations({ limit: 50 })

  const conversationHistory = data?.conversations || []

  const filteredConversations = conversationHistory.filter(
    conversation =>
      conversation.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation as any).agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.outcome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conversation History</CardTitle>
            <CardDescription>
              Browse and analyze past conversations and call recordings
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading conversation history...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <p className="text-muted-foreground">No conversation history found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConversations.map(conversation => (
                  <TableRow key={conversation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{conversation.customerName || 'Unknown'}</p>
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3" />
                          {conversation.customerPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {((conversation as any).agentName || 'AI').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {(conversation as any).agentName || 'Voice Agent'}
                          </p>
                          <p className="text-muted-foreground text-xs">AI Assistant</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <div>
                          <p>{format(new Date(conversation.startedAt), 'MMM dd, HH:mm')}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(conversation.startedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="text-muted-foreground h-3 w-3" />
                        {conversation.duration
                          ? `${Math.floor(conversation.duration / 60)}m ${conversation.duration % 60}s`
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{conversation.outcome || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{getSentimentBadge(conversation.sentiment || undefined)}</TableCell>
                    <TableCell>{getStatusBadge(conversation.status)}</TableCell>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Play Recording
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Transcript
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
