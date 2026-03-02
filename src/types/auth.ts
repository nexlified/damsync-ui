export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface JWTClaims {
  sub: string
  org_id: string
  org_slug: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  exp: number
  iat: number
  jti: string
}

export interface LoginRequest {
  org_slug: string
  email: string
  password: string
}

export interface RegisterRequest {
  org_name: string
  org_slug: string
  email: string
  password: string
}

export interface RegisterResponse {
  org: {
    id: string
    name: string
    slug: string
  }
  tokens: TokenPair
}
