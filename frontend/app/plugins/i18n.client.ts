import type { Locale } from '~/i18n'
import { useLocaleStore } from '~/stores/locale'

export default defineNuxtPlugin(() => {
  const localeStore = useLocaleStore()
  const match = document.cookie.match(/payravel-locale=([^;]+)/)
  if (match) {
    const saved = match[1]
    if (saved === 'pt' || saved === 'en') {
      localeStore.setLocale(saved as Locale)
    }
  }
})
