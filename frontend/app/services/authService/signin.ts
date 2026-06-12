import { httpClient } from '../httpClient'

interface SigninPayload { email: string; password: string }
interface BackendAuthResponse { token: string; data: { name: string; role: string } }
interface AuthResponse { token: string; user: { name: string; role: string } }

export async function signin(payload: SigninPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<BackendAuthResponse>('/api/auth/login', payload)
  return { token: data.token, user: data.data }
}
