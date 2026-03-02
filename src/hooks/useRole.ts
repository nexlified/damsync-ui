import { useAuthStore } from '@/store/auth'

export function useRole() {
  const role = useAuthStore((s) => s.role)
  return {
    role,
    isOwner: role === 'owner',
    isAdmin: role === 'owner' || role === 'admin',
    isEditor: role === 'owner' || role === 'admin' || role === 'editor',
    isViewer: role !== null,
    canWrite: role === 'owner' || role === 'admin' || role === 'editor',
    canAdmin: role === 'owner' || role === 'admin',
  }
}
