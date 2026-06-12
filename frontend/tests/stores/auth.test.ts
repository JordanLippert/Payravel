// frontend/tests/stores/auth.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#app', () => ({
  useCookie: (_key: string, opts?: any) => {
    const _val = { value: opts?.default?.() ?? null }
    return _val
  },
}))

vi.mock('~/services/authService', () => ({
  authService: {
    signin: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('useAuthStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('starts unauthenticated', async () => {
    const { useAuthStore } = await import('~~/stores/auth')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  it('sets token and user on login', async () => {
    const { authService } = await import('~/services/authService')
    vi.mocked(authService.signin).mockResolvedValueOnce({
      token: 'abc123',
      user: { name: 'Marina', role: 'employee' },
    })

    const { useAuthStore } = await import('~~/stores/auth')
    const store = useAuthStore()
    await store.login('marina@test.com', '123456')

    expect(store.token).toBe('abc123')
    expect(store.user?.name).toBe('Marina')
    expect(store.isAuthenticated).toBe(true)
  })

  it('clears state on logout', async () => {
    const { authService } = await import('~/services/authService')
    vi.mocked(authService.logout).mockResolvedValue(undefined)

    const { useAuthStore } = await import('~~/stores/auth')
    const store = useAuthStore()
    store.token = 'abc'
    await store.logout()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })
})
