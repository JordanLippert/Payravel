import { httpClient } from '../httpClient'

export interface CurrencyReport {
  currency: string
  approved: number
  rejected: number
  eur_approved: number
}

export interface EmployeeReport {
  name: string
  approved: number
  rejected: number
  eur_approved: number
}

export interface ReportsSummary {
  total_eur: number
  approved_count: number
  rejected_count: number
  pending_count: number
  expired_count: number
  approval_rate: number
  by_currency: CurrencyReport[]
  by_employee: EmployeeReport[]
}

export async function reports(): Promise<ReportsSummary> {
  const { data } = await httpClient.get<{ data: ReportsSummary }>('/api/finance/reports')
  return data.data
}
