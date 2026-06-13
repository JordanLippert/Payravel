import { httpClient } from '../httpClient'

export interface AppNotification {
  id: string
  type: 'new_request_pending' | 'request_approved' | 'request_rejected'
  data: {
    title: string
    body: string
    request_id: string
  }
  read_at: string | null
  created_at: string
}

export interface NotificationsMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface NotificationsPaginated {
  data: AppNotification[]
  meta: NotificationsMeta
}

export async function list(
  params: { page?: number; filter?: 'all' | 'read' | 'unread' } = {}
): Promise<NotificationsPaginated> {
  const query: Record<string, unknown> = { page: params.page ?? 1 }
  if (params.filter && params.filter !== 'all') query.filter = params.filter

  const { data } = await httpClient.get('/notifications', { params: query })
  return { data: data.data, meta: data.meta }
}

export async function recent(): Promise<AppNotification[]> {
  const { data } = await httpClient.get('/notifications/recent')
  return data.data
}

export async function unreadCount(): Promise<number> {
  const { data } = await httpClient.get('/notifications/unread-count')
  return data.count
}

export async function markRead(id: string): Promise<void> {
  await httpClient.patch(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await httpClient.patch('/notifications/read-all')
}

export const notificationsService = { list, recent, unreadCount, markRead, markAllRead }
