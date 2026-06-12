import { httpClient } from '../httpClient'
import type { PaymentRequest } from './list'

export async function show(id: string): Promise<PaymentRequest> {
  const { data } = await httpClient.get<{ data: PaymentRequest }>(`/api/payment-requests/${id}`)
  return data.data
}
