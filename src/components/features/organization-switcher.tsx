'use client'

import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useOrganizations } from '@/hooks/use-organizations'
import { useOrganizationStore } from '@/store/organization-store'
import { Organization } from '@/lib/types'
import { useState } from 'react'

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useOrganizations()
  const currentOrganization = useOrganizationStore(state => state.currentOrganization)
  const switchOrganization = useOrganizationStore(state => state.switchOrganization)

  const organizations = data?.organizations || []

  const handleSelect = (organizationId: string) => {
    switchOrganization(organizationId)
    setOpen(false)
    // Reload the page to fetch new data for the selected organization
    window.location.reload()
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'pro':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'free':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[240px] justify-between" disabled>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="text-sm">Loading...</span>
        </div>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm">
              {currentOrganization?.name || 'Select organization'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org: Organization) => (
                <CommandItem
                  key={org.id}
                  value={org.id}
                  onSelect={() => handleSelect(org.id)}
                  className="cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0',
                          currentOrganization?.id === org.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium">{org.name}</span>
                        <span
                          className={cn(
                            'mt-0.5 w-fit rounded-md px-1.5 py-0.5 text-xs',
                            getPlanBadgeColor(org.plan)
                          )}
                        >
                          {org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  // Navigate to create organization page
                  window.location.href = '/organizations?action=create'
                }}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm">Create Organization</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
