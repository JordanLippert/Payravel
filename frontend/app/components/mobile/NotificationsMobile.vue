<!-- frontend/app/components/mobile/NotificationsMobile.vue -->
<script setup lang="ts">
import { CheckCheck, CheckCircle, XCircle, FileText } from '@lucide/vue'
import { notificationsService, type AppNotification, type NotificationsMeta } from '~/services/notificationsService'
import { useToast } from 'vue-toastification'
import { useT } from '~/composables/useT'

const toast = useToast()
const router = useRouter()
const { t } = useT()

type FilterValue = 'all' | 'unread' | 'read'

const filter = ref<FilterValue>('all')
const page = ref(1)
const meta = ref<NotificationsMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
const notifications = ref<AppNotification[]>([])
const loading = ref(true)

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
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 18px;">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div style="font-size: 11px; color: var(--text-muted);">Conta</div>
        <div style="font-size: 17px; font-weight: 500; color: var(--text-primary); margin-top: 1px;">{{ t('notifications.title') }}</div>
      </div>
      <button
        type="button"
        style="display: flex; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; font-size: 12px; color: var(--text-muted); font-family: var(--font-sans); padding: 0;"
        @click="markAllRead"
      >
        <CheckCheck :size="14" />
        {{ t('notifications.bell.markAllRead') }}
      </button>
    </div>

    <!-- Filter chips -->
    <div class="flex" style="gap: 7px; overflow-x: auto; margin: 0 -16px; padding: 0 16px 4px;">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        style="flex: none; padding: 6px 13px; border-radius: 999px; cursor: pointer; font-family: var(--font-sans); font-size: 12.5px; font-weight: 500; white-space: nowrap; transition: background 120ms, color 120ms;"
        :style="{
          background: filter === f.value ? 'var(--text-primary)' : 'var(--bg-input)',
          color: filter === f.value ? '#000' : 'var(--text-tertiary)',
          border: `0.5px solid ${filter === f.value ? 'transparent' : 'var(--border-default)'}`,
        }"
        @click="setFilter(f.value)"
      >{{ f.label }}</button>
    </div>

    <!-- List -->
    <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 14px; overflow: hidden;">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" style="display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; border-bottom: 0.5px solid var(--border-subtle);">
          <UiSkeleton width="32px" height="32px" rounded="10px" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
            <UiSkeleton width="55%" height="13px" />
            <UiSkeleton width="80%" height="11px" />
          </div>
        </div>
      </template>

      <div v-else-if="notifications.length === 0" style="padding: 40px 16px; text-align: center; font-size: 13px; color: var(--text-muted);">
        {{ t('notifications.empty') }}
      </div>

      <template v-else>
        <div
          v-for="(n, i) in notifications"
          :key="n.id"
          style="display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; cursor: pointer;"
          :style="{
            background: n.read_at ? 'transparent' : 'rgba(255,255,255,0.02)',
            borderBottom: i < notifications.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
          }"
          @click="n.data.request_id ? router.push(`/requests/${n.data.request_id}`) : (!n.read_at && markRead(n.id))"
        >
          <span
            style="width: 32px; height: 32px; border-radius: 10px; flex: none; display: flex; align-items: center; justify-content: center;"
            :style="{ background: n.read_at ? 'var(--bg-input)' : `color-mix(in srgb, ${iconColorMap[n.type] ?? 'var(--text-muted)'} 12%, transparent)` }"
          >
            <component :is="iconMap[n.type as keyof typeof iconMap] ?? FileText" :size="15" :style="{ color: iconColorMap[n.type] ?? 'var(--text-muted)' }" />
          </span>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
              <span style="font-size: 13.5px; font-weight: 500; color: var(--text-primary);">{{ n.data.title }}</span>
              <span style="font-size: 11px; color: var(--text-muted); flex: none;">{{ timeAgo(n.created_at) }}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-tertiary); margin: 0; line-height: 1.4;">{{ n.data.body }}</p>
          </div>
          <span v-if="!n.read_at" style="width: 7px; height: 7px; border-radius: 999px; background: var(--red-500); flex: none; margin-top: 4px;" />
        </div>
      </template>
    </div>

    <UiPagination
      :current-page="meta.current_page"
      :last-page="meta.last_page"
      :loading="loading"
      @change="setPage"
    />
  </div>
</template>
