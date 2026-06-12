// frontend/app/plugins/httpClient.ts
import { configureHttpClient, setAuthToken, setUnauthorizedCallback } from '~/services/httpClient'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const router = useRouter()

  configureHttpClient(config.public.apiBase as string)

  if (auth.token) {
    setAuthToken(auth.token)
  }

  watch(
    () => auth.token,
    (token) => { setAuthToken(token ?? null) }
  )

  setUnauthorizedCallback(() => {
    if (router.currentRoute.value.path === '/login') return
    auth.token = null
    auth.user = null
    router.push('/login')
  })
})
