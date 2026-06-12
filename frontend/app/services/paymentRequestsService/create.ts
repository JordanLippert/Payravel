import { httpClient } from '../httpClient'
import type { PaymentRequest } from './list'

interface CreatePayload {
  description: string
  amount: number
  currency: string
}

export async function create(payload: CreatePayload): Promise<PaymentRequest> {
  const { data } = await httpClient.post<{ data: PaymentRequest }>('/api/payment-requests', payload)
  return data.data
}
