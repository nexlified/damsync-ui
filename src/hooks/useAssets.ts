import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '@/api/assets'
import type { AssetListParams, AssetUpdateRequest } from '@/types'

export const ASSETS_KEY = 'assets'

export function useAssets(params?: AssetListParams) {
  return useInfiniteQuery({
    queryKey: [ASSETS_KEY, params],
    queryFn: ({ pageParam }) =>
      assetsApi.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor || undefined,
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: [ASSETS_KEY, id],
    queryFn: () => assetsApi.get(id),
    enabled: !!id,
  })
}

export function useUpdateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssetUpdateRequest }) =>
      assetsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ASSETS_KEY] }),
  })
}

export function useDeleteAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ASSETS_KEY] }),
  })
}

export function useMoveAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null }) =>
      assetsApi.move(id, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ASSETS_KEY] }),
  })
}

export function useUploadAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => assetsApi.upload(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ASSETS_KEY] }),
  })
}
