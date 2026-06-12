import { httpClient } from '~/services/httpClient'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  currency: string
  country?: string
  avatar_url?: string | null
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  currency?: string
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export const userService = {
  get: () =>
    httpClient.get<UserProfile>('/api/user').then(r => r.data),

  update: (payload: UpdateProfilePayload) =>
    httpClient.patch<UserProfile>('/api/user', payload).then(r => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    httpClient.post<{ message: string }>('/api/user/password', payload).then(r => r.data),

  uploadAvatar: (blob: Blob) => {
    const form = new FormData()
    form.append('avatar', blob, 'avatar.webp')
    return httpClient
      .post<UserProfile>('/api/user/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data)
  },
}
