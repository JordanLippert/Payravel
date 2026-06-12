import { httpClient } from '../httpClient'
import type { PaymentRequest } from './list'

export async function show(id: string): Promise<PaymentRequest> {
  const { data } = await httpClient.get<{ data: any }>(`/api/payment-requests/${id}`)
  return {
    ...data.data,
    amount_local:  Number(data.data.amount_local),
    amount_eur:    Number(data.data.amount_eur),
    exchange_rate: data.data.exchange_rate != null ? Number(data.data.exchange_rate) : undefined,
  }
}
