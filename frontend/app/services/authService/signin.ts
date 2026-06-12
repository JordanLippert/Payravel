import { httpClient, setAuthToken } from '../httpClient'

interface SigninPayload { email: string; password: string }

interface BackendUser {
  name: string; email: string; role: string
  currency?: string; country?: string; avatar_url?: string | null
}

interface BackendAuthResponse { token: string; data: BackendUser }
interface AuthResponse { token: string; user: BackendUser }

export async function signin(payload: SigninPayload): Promise<AuthResponse> {
  setAuthToken(null)
  const { data } = await httpClient.post<BackendAuthResponse>('/api/auth/login', payload)
  return { token: data.token, user: data.data }
}
