import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeysApi } from '@/api/api-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Plus, Trash2, Copy, Check } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/format'
import type { ApiKeyScope, ApiKeyCreateResponse } from '@/types'

const SCOPES: { value: ApiKeyScope; label: string }[] = [
  { value: 'assets:read', label: 'Read' },
  { value: 'assets:write', label: 'Write' },
  { value: 'assets:delete', label: 'Delete' },
  { value: 'admin', label: 'Admin' },
]

export function APIKeysPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<ApiKeyScope[]>(['assets:read'])
  const [newKey, setNewKey] = useState<ApiKeyCreateResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => apiKeysApi.create({ name: name.trim(), scopes }),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['api-keys'] })
      setOpen(false); setName(''); setScopes(['assets:read'])
      setNewKey(data)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiKeysApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['api-keys'] }),
  })

  const toggleScope = (scope: ApiKeyScope) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
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
          <h3 className="font-medium">API Keys</h3>
          <p className="text-sm text-gray-500">Service-to-service authentication</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Create Key
        </Button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Name</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Prefix</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Scopes</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Last Used</th>
            <th className="py-2 text-left font-medium text-gray-500">Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium">{key.name}</td>
              <td className="py-2 pr-4 font-mono text-xs text-gray-500">{key.key_prefix}...</td>
              <td className="py-2 pr-4">
                <div className="flex flex-wrap gap-1">
                  {key.scopes.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                </div>
              </td>
              <td className="py-2 pr-4 text-gray-400 text-xs">
                {key.last_used_at ? formatDateTime(key.last_used_at) : 'Never'}
              </td>
              <td className="py-2 pr-4 text-gray-400 text-xs">{formatDate(key.created_at)}</td>
              <td className="py-2 text-right">
                <button
                  onClick={() => { if (confirm('Revoke this key?')) deleteMutation.mutate(key.id) }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create API Key</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Service" />
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleScope(value)}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      scopes.includes(value)
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name.trim() || scopes.length === 0 || createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show new key */}
      <Dialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>Copy this key now — it won't be shown again.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3 font-mono text-sm border border-gray-200">
            <span className="flex-1 break-all">{newKey?.raw_key}</span>
            <button onClick={() => void handleCopy(newKey?.raw_key ?? '')} className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
