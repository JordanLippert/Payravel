import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Locale } from '~/i18n'

const COOKIE_NAME = 'payravel-locale'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year in seconds

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>('pt')

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    if (import.meta.client) {
      const secure = location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `${COOKIE_NAME}=${newLocale}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=lax${secure}`
    }
  }

  function toggleLocale() {
    setLocale(locale.value === 'pt' ? 'en' : 'pt')
  }

  return { locale, setLocale, toggleLocale }
})
