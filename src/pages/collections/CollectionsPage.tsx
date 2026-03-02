import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsApi } from '@/api/collections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/format'
import { toast } from '@/hooks/useToast'

export function CollectionsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionsApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => collectionsApi.create({ name: name.trim(), description: description.trim() }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['collections'] })
      setOpen(false); setName(''); setDescription('')
      toast({ title: 'Collection created' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['collections'] }),
  })

  if (isLoading) return <div className="text-sm text-gray-400 py-8 text-center">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Collections</h2>
          <p className="text-sm text-gray-500">Group assets across folders</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
          <BookOpen className="mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">No collections yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Card key={col.id} className="group relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  <Link to={`/collections/${col.id}`} className="hover:underline">{col.name}</Link>
                </CardTitle>
                {col.description && <CardDescription className="text-xs">{col.description}</CardDescription>}
              </CardHeader>
              <CardContent className="text-xs text-gray-400">
                Created {formatDate(col.created_at)}
              </CardContent>
              <button
                onClick={() => { if (confirm('Delete collection?')) deleteMutation.mutate(col.id) }}
                className="absolute right-3 top-3 hidden group-hover:flex items-center text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Collection</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Collection" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
