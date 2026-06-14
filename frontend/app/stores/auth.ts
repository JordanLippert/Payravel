import { defineStore } from 'pinia'
import { computed } from 'vue'
import { authService } from '~/services/authService'

interface User {
  name: string
  email: string
  role: string
  currency?: string
  avatar_url?: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('pv_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7,
  })

  const user = useCookie<User | null>('pv_user', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7,
  })

  const isAuthenticated = computed(() => !!token.value)
  const isFinance = computed(() => user.value?.role === 'finance')

  async function login(email: string, password: string) {
    const data = await authService.signin({ email, password })
    token.value = data.token
    user.value = data.user
  }

  async function register(name: string, email: string, password: string) {
    const data = await authService.signup({
      name,
      email,
      password,
      password_confirmation: password,
    })
    token.value = data.token
    user.value = data.user
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      token.value = null
      user.value = null
    }
  }

  return { token, user, isAuthenticated, isFinance, login, register, logout }
})
