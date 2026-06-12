// frontend/composables/useApi.ts
export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  return function api<T = unknown>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {}
  ) {
    return $fetch<T>(endpoint, {
      baseURL: config.public.apiBase,
      headers: {
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
      },
      ...options,
    })
  }
}
