import { httpClient } from '../httpClient'

export async function logout(): Promise<void> {
  await httpClient.post('/api/auth/logout')
}
