// Minimal Nuxt composable stubs for vitest
import { ref } from 'vue'

export function useRuntimeConfig() {
  return { public: { apiBase: '' } }
}

export function useCookie<T = any>(key: string, opts?: { default?: () => T }) {
  const defaultVal = opts?.default ? opts.default() : null
  return ref<T>(defaultVal as T)
}

export function useNuxtApp() {
  return {}
}

export function navigateTo(path: string) {
  return path
}

export function defineNuxtRouteMiddleware(fn: any) {
  return fn
}
