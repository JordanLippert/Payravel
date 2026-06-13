import { useWindowSize } from '@vueuse/core'
import { computed, ref, onMounted } from 'vue'

export function useIsMobile() {
  const { width } = useWindowSize()
  const mounted = ref(false)
  onMounted(() => { mounted.value = true })
  // Wait for mount so SSR and initial client hydration both return false (desktop),
  // avoiding hydration mismatch. Mobile switch happens after hydration completes.
  return computed(() => mounted.value && width.value < 768)
}
