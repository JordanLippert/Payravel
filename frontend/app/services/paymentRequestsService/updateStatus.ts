import { httpClient } from '../httpClient'
import type { PaymentRequest } from './list'

export async function updateStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<PaymentRequest> {
  const { data } = await httpClient.patch<{ data: PaymentRequest }>(
    `/api/payment-requests/${id}/status`,
    { status }
  )
  return data.data
}
