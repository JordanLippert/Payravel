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

function coerce(r: any): PaymentRequest {
  return {
    ...r,
    amount_local:  Number(r.amount_local),
    amount_eur:    Number(r.amount_eur),
    exchange_rate: r.exchange_rate != null ? Number(r.exchange_rate) : undefined,
  }
}

export async function list(): Promise<PaymentRequest[]> {
  const { data } = await httpClient.get<{ data: any[] }>('/api/payment-requests')
  return data.data.map(coerce)
}
