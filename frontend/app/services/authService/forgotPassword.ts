import { httpClient } from '../httpClient'

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await httpClient.post<{ message: string }>('/api/auth/forgot-password', { email })
  return data
}
