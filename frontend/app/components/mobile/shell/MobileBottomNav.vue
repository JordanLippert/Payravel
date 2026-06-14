<!-- app/components/mobile/shell/MobileBottomNav.vue -->
<script setup lang="ts">
import { Home, Receipt, Plus, Shield, User } from '@lucide/vue'
import { useAuthStore } from '~/stores/auth'
import { useT } from '~/composables/useT'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useT()

// Hide on flow screens (new request and detail)
const hidden = computed(() =>
  route.path.startsWith('/requests/')
)

const employeeTabs = computed(() => [
  { id: 'home',    label: t('nav.home'),        icon: Home,    to: '/' },
  { id: 'history', label: t('nav.requests'),    icon: Receipt, to: '/history' },
  { id: 'new',     label: t('nav.newRequest'),  icon: Plus,    to: '/requests/new' },
  { id: 'profile', label: t('nav.profile'),     icon: User,    to: '/profile' },
])

const financeTabs = computed(() => [
  { id: 'home',    label: t('nav.home'),     icon: Home,    to: '/finance' },
  { id: 'history', label: t('nav.requests'), icon: Receipt, to: '/finance/history' },
  { id: 'finance', label: t('nav.finance'),  icon: Shield,  to: '/finance/reports' },
  { id: 'profile', label: t('nav.profile'),  icon: User,    to: '/profile' },
])

const tabs = computed(() => auth.isFinance ? financeTabs.value : employeeTabs.value)

function isActive(tab: { id: string; label: string; icon: unknown; to: string }) {
  if (tab.to === '/' || tab.to === '/finance') return route.path === tab.to
  return route.path.startsWith(tab.to)
}
</script>

<template>
  <nav
    v-if="!hidden"
    class="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around"
    style="
      background: rgba(14,14,14,0.96);
      backdrop-filter: blur(12px);
      border-top: 0.5px solid var(--border-subtle);
      padding: 8px 8px 18px;
    "
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="flex flex-col items-center transition-colors duration-[120ms]"
      style="gap: 3px; min-width: 56px; background: none; border: none; cursor: pointer; padding: 0;"
      :style="{
        color: isActive(tab) ? 'var(--red-500)' : 'var(--text-muted)',
      }"
      @click="router.push(tab.to)"
    >
      <component :is="tab.icon" :size="20" :stroke-width="isActive(tab) ? 2.2 : 1.8" />
      <span
        class="text-center leading-tight whitespace-pre-wrap"
        style="font-size: 8px; font-family: var(--font-sans);"
        :style="{ color: isActive(tab) ? 'var(--text-primary)' : 'var(--text-muted)' }"
      >{{ tab.label }}</span>
    </button>
  </nav>
</template>
