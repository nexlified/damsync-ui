import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { webhooksApi } from '@/api/webhooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ChevronDown, ChevronRight, Zap } from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import type { WebhookDelivery } from '@/types'
import { toast } from '@/hooks/useToast'

function DeliveryRow({ delivery }: { delivery: WebhookDelivery }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 text-sm"
      >
        {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        <Badge variant={delivery.status === 'success' ? 'success' : 'destructive'}>{delivery.status}</Badge>
        <span className="font-mono text-xs text-gray-500">{delivery.event}</span>
        <span className="text-xs text-gray-400 ml-auto">attempt {delivery.attempts}</span>
        <span className="text-xs text-gray-400 ml-3">{formatDateTime(delivery.created_at)}</span>
      </button>
      {expanded && (
        <div className="bg-gray-50 px-4 pb-3">
          <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">
            {JSON.stringify(delivery.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export function WebhookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: webhook } = useQuery({
    queryKey: ['webhooks', id],
    queryFn: () => webhooksApi.get(id!),
    enabled: !!id,
  })

  const { data: deliveries = [] } = useQuery({
    queryKey: ['webhooks', id, 'deliveries'],
    queryFn: () => webhooksApi.getDeliveries(id!, { limit: 50 }),
    enabled: !!id,
  })

  const testMutation = useMutation({
    mutationFn: () => webhooksApi.test(id!),
    onSuccess: () => {
      toast({ title: 'Test sent' })
      void qc.invalidateQueries({ queryKey: ['webhooks', id, 'deliveries'] })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: () => webhooksApi.update(id!, { active: !webhook?.active }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['webhooks', id] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/settings/webhooks"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h3 className="font-medium">Webhook Details</h3>
      </div>

      {webhook && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono">{webhook.url}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={webhook.active ? 'success' : 'secondary'}>{webhook.active ? 'Active' : 'Paused'}</Badge>
                <Button size="sm" variant="outline" onClick={() => toggleActiveMutation.mutate()}>
                  {webhook.active ? 'Pause' : 'Activate'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
                  <Zap className="mr-1 h-3.5 w-3.5" /> Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {webhook.events.map((e) => <Badge key={e} variant="outline" className="text-xs font-mono">{e}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Delivery Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {deliveries.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">No deliveries yet</p>
          ) : (
            deliveries.map((d) => <DeliveryRow key={d.id} delivery={d} />)
          )}
        </CardContent>
      </Card>
    </div>
  )
}
