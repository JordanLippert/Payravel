// frontend/app/services/httpClient.ts
import axios from 'axios'

let _token: string | null = null
let _onUnauthorized: (() => void) | null = null

export const httpClient = axios.create({ timeout: 30000 })

export function configureHttpClient(baseURL: string) {
  httpClient.defaults.baseURL = baseURL
}

export function setAuthToken(token: string | null) {
  _token = token
}

export function setUnauthorizedCallback(cb: () => void) {
  _onUnauthorized = cb
}

httpClient.interceptors.request.use((config) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && _onUnauthorized && !url.includes('/auth/')) {
      _onUnauthorized()
    }
    return Promise.reject(error)
  }
)
