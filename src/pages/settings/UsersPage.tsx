import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { UserRole } from '@/types'
import { toast } from '@/hooks/useToast'

const roleColors: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  editor: 'outline',
  viewer: 'outline',
}

export function UsersPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('editor')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => usersApi.create({ email: email.trim(), password, role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      setOpen(false); setEmail(''); setPassword(''); setRole('editor')
      toast({ title: 'User invited' })
    },
    onError: () => toast({ title: 'Failed to create user', variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  })

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Users</h3>
          <p className="text-sm text-gray-500">Manage team members and their roles</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Invite User
        </Button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Email</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Role</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Status</th>
            <th className="py-2 text-left font-medium text-gray-500">Joined</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-mono text-xs">{user.email}</td>
              <td className="py-2 pr-4">
                <Badge variant={roleColors[user.role]}>{user.role}</Badge>
              </td>
              <td className="py-2 pr-4">
                <Badge variant={user.active ? 'success' : 'secondary'}>
                  {user.active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="py-2 pr-4 text-gray-400">{formatDate(user.created_at)}</td>
              <td className="py-2 text-right">
                {user.role !== 'owner' && (
                  <button
                    onClick={() => { if (confirm('Remove user?')) deleteMutation.mutate(user.id) }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set initial password" />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!email.trim() || !password || createMutation.isPending}>
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
