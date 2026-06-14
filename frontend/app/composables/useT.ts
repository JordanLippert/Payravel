import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { dictionaries } from '~/i18n'
import { useLocaleStore } from '~/stores/locale'

export function useT() {
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)

  // Reactive dict — tracked by templates, so `t()` calls re-render when locale changes
  const dict = computed(() => dictionaries[locale.value])

  function t(path: string, vars?: Record<string, string | number>): string {
    const keys = path.split('.')
    let value: unknown = dict.value
    for (const key of keys) {
      if (value == null || typeof value !== 'object') return path
      value = (value as Record<string, unknown>)[key]
    }
    if (typeof value !== 'string') return path
    if (!vars) return value
    return value.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
  }

  return {
    t,
    locale,
    setLocale: localeStore.setLocale,
    toggleLocale: localeStore.toggleLocale,
  }
}
