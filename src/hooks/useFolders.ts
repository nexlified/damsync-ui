import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { foldersApi } from '@/api/folders'
import type { FolderRequest } from '@/types'

const FOLDERS_KEY = 'folders'

export function useFolderTree() {
  return useQuery({
    queryKey: [FOLDERS_KEY, 'tree'],
    queryFn: () => foldersApi.tree(),
  })
}

export function useFolders() {
  return useQuery({
    queryKey: [FOLDERS_KEY],
    queryFn: () => foldersApi.list(),
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FolderRequest) => foldersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FOLDERS_KEY] }),
  })
}

export function useDeleteFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => foldersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FOLDERS_KEY] }),
  })
}
