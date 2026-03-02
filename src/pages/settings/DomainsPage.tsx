import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { domainsApi } from '@/api/domains'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/useToast'

export function DomainsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [domain, setDomain] = useState('')

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => domainsApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => domainsApi.create({ domain: domain.trim() }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['domains'] })
      setOpen(false); setDomain('')
      toast({ title: 'Domain added', description: 'Point your CNAME to the platform domain and then verify' })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (id: string) => domainsApi.verify(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['domains'] })
      toast({ title: 'Verification requested' })
    },
    onError: () => toast({ title: 'Verification failed', description: 'Check your CNAME record', variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => domainsApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['domains'] }),
  })

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Custom Domains</h3>
          <p className="text-sm text-gray-500">Route asset delivery through your own domain</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Domain
        </Button>
      </div>

      {domains.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">No custom domains configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {domains.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{d.domain}</span>
                  {d.is_primary && <Badge variant="default">Primary</Badge>}
                  {d.verified_at ? (
                    <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>
                  ) : (
                    <Badge variant="warning"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
                  )}
                  <Badge variant="outline">{d.tls_status}</Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  {!d.verified_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyMutation.mutate(d.id)}
                      disabled={verifyMutation.isPending}
                    >
                      <RefreshCw className="mr-1 h-3.5 w-3.5" /> Verify
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { if (confirm('Remove domain?')) deleteMutation.mutate(d.id) }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Custom Domain</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Domain</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="assets.example.com"
              />
            </div>
            <p className="text-xs text-gray-400">
              After adding, create a CNAME record pointing to the platform domain, then click Verify.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!domain.trim() || createMutation.isPending}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
