<script setup lang="ts">
import { CheckCheck, CheckCircle, XCircle, FileText } from '@lucide/vue'
import { notificationsService, type AppNotification, type NotificationsMeta } from '~/services/notificationsService'
import { useAuthStore } from '~/stores/auth'
import { useToast } from 'vue-toastification'
import { useT } from '~/composables/useT'

definePageMeta({ middleware: 'auth' })
const isMobile = useIsMobile()

const auth = useAuthStore()
const toast = useToast()
const { t } = useT()

const nav = computed(() => {
  const isFinance = auth.user?.role === 'finance'
  return [
    { label: isFinance ? t('nav.panel') : t('nav.dashboard'), to: isFinance ? '/finance' : '/' },
    { label: t('notifications.title'), active: true },
  ]
})

type FilterValue = 'all' | 'unread' | 'read'

const filter = ref<FilterValue>('all')
const page = ref(1)
const meta = ref<NotificationsMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
const notifications = ref<AppNotification[]>([])
const loading = ref(true)

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all',    label: 'Todas' },
  { value: 'unread', label: 'Não lidas' },
  { value: 'read',   label: 'Lidas' },
]

const filters = computed<{ value: FilterValue; label: string }[]>(() => [
  { value: 'all',    label: t('notifications.filters.all') },
  { value: 'unread', label: t('notifications.filters.unread') },
  { value: 'read',   label: t('notifications.filters.read') },
])

async function fetchNotifications() {
  loading.value = true
  try {
    const result = await notificationsService.list({ page: page.value, filter: filter.value })
    notifications.value = result.data
    meta.value = result.meta
  } catch {
    toast.error(t('shared.errors.loadNotifications'))
  } finally {
    loading.value = false
  }
}

function setFilter(f: FilterValue) {
  filter.value = f
  page.value = 1
  fetchNotifications()
}

function setPage(p: number) {
  page.value = p
  fetchNotifications()
}

async function markRead(id: string) {
  try {
    await notificationsService.markRead(id)
    notifications.value = notifications.value.map(n =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    )
  } catch { /* silent */ }
}

async function markAllRead() {
  try {
    await notificationsService.markAllRead()
    notifications.value = notifications.value.map(n => ({ ...n, read_at: new Date().toISOString() }))
  } catch { /* silent */ }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return t('notifications.timeNow')
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const iconMap = {
  new_request_pending: FileText,
  request_approved:    CheckCircle,
  request_rejected:    XCircle,
} as const

const iconColorMap: Record<string, string> = {
  new_request_pending: 'var(--status-pending-fg)',
  request_approved:    'var(--status-approved-fg)',
  request_rejected:    'var(--status-rejected-fg)',
}

onMounted(fetchNotifications)
</script>

<template>
  <NotificationsMobile v-if="isMobile" />

  <div v-else>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 860px; margin: 0 auto;">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-medium mb-1" style="font-size: 22px; color: var(--text-primary);">{{ t('notifications.title') }}</h1>
          <p class="text-sm" style="color: var(--text-tertiary);">{{ t('notifications.subtitle') }}</p>
        </div>
        <button
          type="button"
          style="display: flex; align-items: center; gap: 6px; background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 8px; padding: 7px 12px; cursor: pointer; font-size: 13px; color: var(--text-secondary); font-family: var(--font-sans); transition: border-color 120ms;"
          @click="markAllRead"
        >
          <CheckCheck :size="14" />
          {{ t('notifications.markAllRead') }}
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="flex" style="gap: 4px; margin-bottom: 20px; border-bottom: 0.5px solid var(--border-subtle); padding-bottom: 0;">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          style="padding: 8px 14px; background: none; border: none; cursor: pointer; font-size: 13.5px; font-family: var(--font-sans); transition: color 120ms; position: relative; bottom: -0.5px;"
          :style="{
            color: filter === f.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontWeight: filter === f.value ? '500' : '400',
            borderBottom: filter === f.value ? '1.5px solid var(--text-primary)' : '1.5px solid transparent',
          }"
          @click="setFilter(f.value)"
        >{{ f.label }}</button>
      </div>

      <!-- Table -->
      <UiCard :padded="false">
        <template v-if="loading">
          <table class="w-full" style="border-collapse: collapse;">
            <tbody>
              <tr v-for="(w, i) in ['60%','75%','55%','65%','70%']" :key="i"
                :style="{ borderBottom: i < 4 ? '0.5px solid var(--border-subtle)' : 'none' }">
                <td style="padding: 14px 20px; width: 36px;"><UiSkeleton width="32px" height="32px" rounded="9px" /></td>
                <td style="padding: 14px 12px;"><UiSkeleton :width="w" height="13px" /><UiSkeleton width="45%" height="11px" style="margin-top: 5px;" /></td>
                <td style="padding: 14px 20px;"><UiSkeleton width="40px" height="11px" /></td>
              </tr>
            </tbody>
          </table>
        </template>

        <div v-else-if="notifications.length === 0" class="py-10 text-center text-sm" style="color: var(--text-muted);">
          {{ t('notifications.empty') }}
        </div>

        <table v-else class="w-full" style="border-collapse: collapse;">
          <tbody>
            <tr
              v-for="(n, i) in notifications"
              :key="n.id"
              class="notif-row"
              style="cursor: pointer; transition: background 100ms;"
              :style="{
                borderBottom: i < notifications.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
                background: n.read_at ? 'transparent' : 'rgba(255,255,255,0.015)',
              }"
              @click="n.data.request_id ? $router.push(`/requests/${n.data.request_id}`) : (!n.read_at && markRead(n.id))"
            >
              <td style="padding: 13px 16px 13px 20px; width: 36px;">
                <span
                  style="width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex: none;"
                  :style="{ background: n.read_at ? 'var(--bg-input)' : `color-mix(in srgb, ${iconColorMap[n.type] ?? 'var(--text-muted)'} 12%, transparent)` }"
                >
                  <component :is="iconMap[n.type as keyof typeof iconMap] ?? FileText" :size="14" :style="{ color: iconColorMap[n.type] ?? 'var(--text-muted)' }" />
                </span>
              </td>
              <td style="padding: 13px 12px;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px;">{{ n.data.title }}</div>
                <div style="font-size: 12.5px; color: var(--text-tertiary);">{{ n.data.body }}</div>
              </td>
              <td style="padding: 13px 20px; text-align: right; white-space: nowrap;">
                <div style="font-size: 12px; color: var(--text-muted);">{{ timeAgo(n.created_at) }}</div>
                <span v-if="!n.read_at" style="display: inline-block; width: 6px; height: 6px; border-radius: 999px; background: var(--red-500); margin-top: 4px;" />
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!loading && notifications.length > 0" style="padding: 12px 20px; border-top: 0.5px solid var(--border-subtle);">
          <UiPagination
            :current-page="meta.current_page"
            :last-page="meta.last_page"
            :loading="loading"
            @change="setPage"
          />
        </div>
      </UiCard>
    </main>
  </div>
</template>

<style scoped>
.notif-row:hover { background: var(--bg-row-hover) !important; }
</style>
