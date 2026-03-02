export interface Domain {
  id: string
  org_id: string
  domain: string
  is_primary: boolean
  verified_at: string | null
  tls_status: string
  created_at: string
}

export interface DomainRequest {
  domain: string
}
