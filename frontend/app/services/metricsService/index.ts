import { httpClient } from '../httpClient'

export interface MetricResult {
  count: number
  amount: number
}

export const metricsService = {
  total:    () => httpClient.get<MetricResult>('/api/metrics/total').then(r => r.data),
  pending:  () => httpClient.get<MetricResult>('/api/metrics/pending').then(r => r.data),
  approved: () => httpClient.get<MetricResult>('/api/metrics/approved').then(r => r.data),
  rejected: () => httpClient.get<MetricResult>('/api/metrics/rejected').then(r => r.data),
}
