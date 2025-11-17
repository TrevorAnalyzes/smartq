'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bot, MessageSquare, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useAgents } from '@/hooks/use-agents'
import { useConversations } from '@/hooks/use-conversations'
import { useOrganizations } from '@/hooks/use-organizations'
import { Badge } from '@/components/ui/badge'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const { data: agents = [] } = useAgents()
  const { data: conversationsData } = useConversations({ limit: 50 })
  const { data: organizationsData } = useOrganizations()

  const conversations = conversationsData?.conversations || []
  const organizations = organizationsData?.organizations || []

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOrganizations = organizations.filter((org: any) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (callback: () => void) => {
    setOpen(false)
    callback()
  }

  return (
    <>
      <div className="relative hidden md:block">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/70" />
        <Input
          placeholder=""
          aria-label="Open global search"
          className="w-64 pl-10 cursor-pointer bg-transparent text-sidebar-foreground border-sidebar-foreground/40 placeholder:text-transparent"
          onClick={() => setOpen(true)}
          readOnly
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar/80 px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/80 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search assistants, conversations, organizations..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {filteredAgents.length > 0 && (
            <CommandGroup heading="Assistants">
              {filteredAgents.slice(0, 5).map((agent) => (
                <CommandItem
                  key={agent.id}
                  onSelect={() => handleSelect(() => router.push('/agents'))}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  <span>{agent.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {agent.status}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredConversations.length > 0 && (
            <CommandGroup heading="Conversations">
              {filteredConversations.slice(0, 5).map((conv) => (
                <CommandItem
                  key={conv.id}
                  onSelect={() => handleSelect(() => router.push('/conversations'))}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>{conv.customerName || 'Unknown'}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {conv.status}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredOrganizations.length > 0 && (
            <CommandGroup heading="Organizations">
              {filteredOrganizations.slice(0, 5).map((org: any) => (
                <CommandItem
                  key={org.id}
                  onSelect={() =>
                    handleSelect(() => router.push(`/organizations/${org.id}/dashboard`))
                  }
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{org.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {org.plan}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchQuery === '' && (
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => handleSelect(() => router.push('/agents'))}>
                <Bot className="mr-2 h-4 w-4" />
                <span>View All Assistants</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push('/conversations'))}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>View All Conversations</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

