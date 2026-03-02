import client from './client'
import type { Webhook, WebhookRequest, WebhookDelivery, WebhookCreateResponse } from '@/types'

export const webhooksApi = {
  list: () =>
    client.get<Webhook[]>('/webhooks').then((r) => r.data),

  get: (id: string) =>
    client.get<Webhook>(`/webhooks/${id}`).then((r) => r.data),

  create: (data: WebhookRequest) =>
    client.post<WebhookCreateResponse>('/webhooks', data).then((r) => r.data),

  update: (id: string, data: Partial<WebhookRequest>) =>
    client.put<Webhook>(`/webhooks/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/webhooks/${id}`),

  test: (id: string) =>
    client.post(`/webhooks/${id}/test`),

  getDeliveries: (id: string, params?: { limit?: number; offset?: number }) =>
    client.get<WebhookDelivery[]>(`/webhooks/${id}/deliveries`, { params }).then((r) => r.data),
}
