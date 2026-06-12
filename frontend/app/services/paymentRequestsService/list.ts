import { httpClient } from '../httpClient'

export interface PaymentRequest {
  id: string
  description: string
  amount_local: number
  currency: string
  amount_eur: number
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  created_at: string
  expires_at?: string
  reviewed_at?: string
  user?: { name: string }
}

export async function list(): Promise<PaymentRequest[]> {
  const { data } = await httpClient.get<{ data: PaymentRequest[] }>('/api/payment-requests')
  return data.data
}
