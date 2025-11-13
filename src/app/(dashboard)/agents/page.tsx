import { AgentsList } from '@/components/features/agents-list'
import { AgentStats } from '@/components/features/agent-stats'
import { CreateAgentDialog } from '@/components/features/create-agent-dialog'

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Agent Management</h1>
          <p className="text-muted-foreground">
            Configure and manage your AI voice agents with British accents and phone calling
            capabilities
          </p>
        </div>
        <CreateAgentDialog />
      </div>

      <AgentStats />
      <AgentsList />
    </div>
  )
}
