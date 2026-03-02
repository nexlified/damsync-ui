export type WebhookEvent =
  | 'asset.created'
  | 'asset.updated'
  | 'asset.deleted'
  | 'asset.transformed'
  | 'upload.failed'

export interface Webhook {
  id: string
  org_id: string
  url: string
  events: WebhookEvent[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface WebhookRequest {
  url: string
  events: WebhookEvent[]
  active?: boolean
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event: WebhookEvent
  payload: Record<string, unknown>
  status: 'success' | 'failed' | 'pending'
  attempts: number
  next_retry_at: string | null
  created_at: string
  updated_at: string
}

export interface WebhookCreateResponse extends Webhook {
  secret: string
}
