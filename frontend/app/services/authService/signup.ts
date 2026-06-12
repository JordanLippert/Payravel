import { httpClient } from '../httpClient'

interface SignupPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  currency?: string
  country?: string
}
interface BackendUser {
  name: string; email: string; role: string
  currency?: string; country?: string; avatar_url?: string | null
}
interface BackendAuthResponse { token: string; data: BackendUser }
interface AuthResponse { token: string; user: BackendUser }

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<BackendAuthResponse>('/api/auth/register', payload)
  return { token: data.token, user: data.data }
}
