export type ApiKeyScope = 'assets:read' | 'assets:write' | 'assets:delete' | 'admin'

export interface ApiKey {
  id: string
  org_id: string
  user_id: string
  name: string
  key_prefix: string
  scopes: ApiKeyScope[]
  last_used_at: string | null
  ip_allowlist: string[]
  created_at: string
}

export interface ApiKeyRequest {
  name: string
  scopes: ApiKeyScope[]
  ip_allowlist?: string[]
}

export interface ApiKeyCreateResponse extends ApiKey {
  raw_key: string
}
