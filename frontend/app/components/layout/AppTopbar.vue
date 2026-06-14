<!-- frontend/components/layout/AppTopbar.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { LogOut, User } from '@lucide/vue'
import { useAuthStore } from '~/stores/auth'
import { useT } from '~/composables/useT'

interface NavItem { label: string; active?: boolean; to?: string }
interface User { name: string; role?: string | null }

const props = withDefaults(defineProps<{
  nav?: NavItem[]
  user?: User
}>(), {
  nav: () => [],
  user: () => ({ name: '' }),
})

const emit = defineEmits<{ nav: [item: NavItem] }>()

const logoHover = ref(false)
const menuOpen = ref(false)
const menuRef = ref<HTMLElement>()

onClickOutside(menuRef, () => { menuOpen.value = false })

const auth = useAuthStore()
const router = useRouter()
const { t } = useT()

async function logout() {
  menuOpen.value = false
  try { await auth.logout() } catch { /* token already invalid */ }
  auth.token = null
  auth.user = null
  router.push('/login')
}
</script>

<template>
  <header
    class="flex items-center gap-8 h-[60px] px-6 font-sans"
    style="background: var(--bg-surface); border-bottom: 0.5px solid var(--border-subtle);"
  >
    <NuxtLink to="/" class="flex items-center" @mouseenter="logoHover = true" @mouseleave="logoHover = false">
      <AppLogo :size="48" :animated="logoHover" />
    </NuxtLink>

    <nav class="flex items-center gap-1">
      <NuxtLink
        v-for="item in nav"
        :key="item.label"
        :to="item.to || '/'"
        class="px-3 py-1.5 rounded-sm text-sm transition-colors duration-[120ms]"
        :style="{
          fontWeight: item.active ? 500 : 400,
          color: item.active ? 'var(--text-primary)' : 'var(--text-tertiary)',
        }"
      >{{ item.label }}</NuxtLink>
    </nav>

    <div class="ml-auto flex items-center gap-2">
      <UiLangToggle />
      <UiNotificationBell />

      <div class="relative" ref="menuRef">
      <button
        type="button"
        class="cursor-pointer bg-transparent border-none p-0"
        @click="menuOpen = !menuOpen"
      >
        <UiPill :name="user.name" :role="user.role ?? null" :avatar-url="auth.user?.avatar_url" />
      </button>

      <Transition name="dropdown">
        <div
          v-if="menuOpen"
          class="absolute right-0 top-[calc(100%+8px)] z-50 rounded-md border-[0.5px] py-1 min-w-[160px]"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-menu)' }"
        >
          <NuxtLink
            to="/profile"
            class="w-full flex items-center justify-between px-3 py-2 text-sm font-sans no-underline transition-colors duration-[120ms]"
            style="color: var(--text-primary); display: flex;"
            @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--bg-row-hover)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
            @click="menuOpen = false"
          >
            {{ t('profile.menu.profile') }}
            <User :size="14" style="color: var(--text-muted);" />
          </NuxtLink>

          <div style="height: 0.5px; background: var(--border-subtle); margin: 3px 0;" />

          <button
            type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors duration-[120ms] font-sans"
            style="background: transparent; border: none; cursor: pointer; color: var(--status-rejected-fg);"
            @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--status-rejected-bg)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
            @click="logout"
          >
            {{ t('profile.menu.logout') }}
            <LogOut :size="14" />
          </button>
        </div>
      </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 120ms ease, transform 120ms ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
