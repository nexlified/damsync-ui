import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stylesApi } from '@/api/styles'
import type { ImageStyleRequest } from '@/types'

const STYLES_KEY = 'styles'

export function useStyles() {
  return useQuery({ queryKey: [STYLES_KEY], queryFn: () => stylesApi.list() })
}

export function useStyle(id: string) {
  return useQuery({
    queryKey: [STYLES_KEY, id],
    queryFn: () => stylesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateStyle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ImageStyleRequest) => stylesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STYLES_KEY] }),
  })
}

export function useUpdateStyle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ImageStyleRequest> }) =>
      stylesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STYLES_KEY] }),
  })
}

export function useDeleteStyle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stylesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STYLES_KEY] }),
  })
}
