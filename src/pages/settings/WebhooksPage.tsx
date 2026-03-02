import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { webhooksApi } from '@/api/webhooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Plus, Trash2, Zap, ExternalLink, Copy } from 'lucide-react'
import type { WebhookEvent, WebhookCreateResponse } from '@/types'
import { toast } from '@/hooks/useToast'

const ALL_EVENTS: WebhookEvent[] = [
  'asset.created', 'asset.updated', 'asset.deleted', 'asset.transformed', 'upload.failed'
]

export function WebhooksPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<WebhookEvent[]>(['asset.created'])
  const [newWebhook, setNewWebhook] = useState<WebhookCreateResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => webhooksApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => webhooksApi.create({ url: url.trim(), events, active: true }),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] })
      setOpen(false); setUrl(''); setEvents(['asset.created'])
      setNewWebhook(data)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['webhooks'] }),
  })

  const testMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.test(id),
    onSuccess: () => toast({ title: 'Test event sent' }),
    onError: () => toast({ title: 'Test failed', variant: 'destructive' }),
  })

  const toggleEvent = (e: WebhookEvent) => {
    setEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Webhooks</h3>
          <p className="text-sm text-gray-500">Receive notifications for DAM events</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-400">No webhooks configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs truncate">{wh.url}</span>
                  <Badge variant={wh.active ? 'success' : 'secondary'}>{wh.active ? 'Active' : 'Paused'}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {wh.events.map((e) => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-4">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/settings/webhooks/${wh.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testMutation.mutate(wh.id)}
                  disabled={testMutation.isPending}
                >
                  <Zap className="h-3.5 w-3.5" />
                </Button>
                <button
                  onClick={() => { if (confirm('Delete webhook?')) deleteMutation.mutate(wh.id) }}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Webhook</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_EVENTS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEvent(e)}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors font-mono ${
                      events.includes(e)
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!url.trim() || events.length === 0 || createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show secret */}
      <Dialog open={!!newWebhook} onOpenChange={() => setNewWebhook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Created</DialogTitle>
            <DialogDescription>Save this signing secret — it won't be shown again.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md bg-gray-50 border border-gray-200 p-3 font-mono text-sm">
            <span className="flex-1 break-all">{(newWebhook as WebhookCreateResponse & { secret?: string })?.secret}</span>
            <button onClick={() => void handleCopy((newWebhook as WebhookCreateResponse & { secret?: string })?.secret ?? '')}>
              <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : 'text-gray-400'}`} />
            </button>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewWebhook(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
