import { httpClient } from '../httpClient'

export interface PaymentRequest {
  id: string
  description: string
  amount_local: number
  currency: string
  exchange_rate?: number
  exchange_rate_source?: string
  amount_eur: number
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  created_at: string
  expires_at?: string
  reviewed_at?: string
  user?: { name: string }
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResult {
  data: PaymentRequest[]
  meta: PaginationMeta
}

function coerce(r: any): PaymentRequest {
  return {
    ...r,
    amount_local:  Number(r.amount_local),
    amount_eur:    Number(r.amount_eur),
    exchange_rate: r.exchange_rate != null ? Number(r.exchange_rate) : undefined,
  }
}

export async function list(params: { page?: number; status?: string } = {}): Promise<PaginatedResult> {
  const query: Record<string, string | number> = { page: params.page ?? 1 }
  if (params.status) query.status = params.status

  const { data } = await httpClient.get<{ data: any[]; meta: PaginationMeta }>('/api/payment-requests', { params: query })
  return {
    data: data.data.map(coerce),
    meta: data.meta,
  }
}
