export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  org_id: string
  email: string
  role: UserRole
  active: boolean
  created_at: string
  updated_at: string
}

export interface UserRequest {
  email: string
  password?: string
  role: UserRole
  active?: boolean
}
