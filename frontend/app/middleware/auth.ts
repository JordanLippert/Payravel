import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  if (to.path === '/' && auth.isFinance) {
    return navigateTo('/finance')
  }

  if (to.path.startsWith('/finance') && !auth.isFinance) {
    return navigateTo('/')
  }
})
