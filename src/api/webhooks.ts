import client from './client'
import type { Webhook, WebhookRequest, WebhookDelivery } from '@/types'

export const webhooksApi = {
  list: () =>
    client.get<{ data: Webhook[] | null }>('/webhooks').then((r) => r.data.data ?? []),

  get: (id: string) =>
    client.get<Webhook>(`/webhooks/${id}`).then((r) => r.data),

  create: (data: WebhookRequest) =>
    client.post<{ webhook: Webhook; secret: string }>('/webhooks', data).then((r) => ({ ...r.data.webhook, secret: r.data.secret })),

  update: (id: string, data: Partial<WebhookRequest>) =>
    client.put<Webhook>(`/webhooks/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/webhooks/${id}`),

  test: (id: string) =>
    client.post(`/webhooks/${id}/test`),

  getDeliveries: (id: string, params?: { limit?: number; offset?: number }) =>
    client.get<{ data: WebhookDelivery[] | null }>(`/webhooks/${id}/deliveries`, { params }).then((r) => r.data.data ?? []),
}
