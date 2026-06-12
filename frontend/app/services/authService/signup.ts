import { httpClient } from '../httpClient'

interface SignupPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  currency?: string
  country?: string
}
interface BackendAuthResponse { token: string; data: { name: string; role: string } }
interface AuthResponse { token: string; user: { name: string; role: string } }

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<BackendAuthResponse>('/api/auth/register', payload)
  return { token: data.token, user: data.data }
}
