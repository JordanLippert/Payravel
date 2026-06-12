import { httpClient } from '../httpClient'

interface ExchangeRate {
  currency: string
  rate: number
  source?: string
  fetched_at: string
  expires_at: string
}

export async function show(currency: string): Promise<ExchangeRate> {
  const { data } = await httpClient.get<ExchangeRate>(`/api/exchange-rates/${currency}`)
  return data
}
