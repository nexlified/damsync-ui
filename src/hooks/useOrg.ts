import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orgsApi } from '@/api/orgs'
import type { OrgUpdateRequest } from '@/types'

const ORG_KEY = 'org'

export function useOrg() {
  return useQuery({ queryKey: [ORG_KEY, 'me'], queryFn: () => orgsApi.getMe() })
}

export function useOrgStorage() {
  return useQuery({ queryKey: [ORG_KEY, 'storage'], queryFn: () => orgsApi.getStorage() })
}

export function useUpdateOrg() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrgUpdateRequest) => orgsApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORG_KEY] }),
  })
}
