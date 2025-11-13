import { ConversationStats } from '@/components/features/conversation-stats'
import { LiveConversations } from '@/components/features/live-conversations'
import { ConversationHistory } from '@/components/features/conversation-history'

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversation Logs</h1>
        <p className="text-muted-foreground">
          Real-time conversation monitoring and historical conversation logs
        </p>
      </div>

      <ConversationStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LiveConversations />
        </div>
        <div className="lg:col-span-2">
          <ConversationHistory />
        </div>
      </div>
    </div>
  )
}
