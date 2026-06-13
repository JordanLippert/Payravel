<!-- frontend/app/components/ui/UiNotificationDropdown.vue -->
<script setup lang="ts">
import { CheckCheck, CheckCircle, XCircle, FileText } from '@lucide/vue'
import type { AppNotification } from '~/services/notificationsService'

defineProps<{
  notifications: AppNotification[]
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  'mark-read': [id: string]
  'mark-all-read': []
}>()

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'agora'
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
</script>

<template>
  <div
    style="position: absolute; right: 0; top: calc(100% + 8px); width: 320px; border-radius: 12px; border: 0.5px solid var(--border-default); background: var(--bg-elevated); box-shadow: var(--shadow-menu); z-index: 100; overflow: hidden;"
  >
    <!-- Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px 10px; border-bottom: 0.5px solid var(--border-subtle);">
      <span style="font-size: 13px; font-weight: 500; color: var(--text-primary);">Notificações</span>
      <button
        type="button"
        style="display: flex; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; font-size: 11.5px; color: var(--text-muted); padding: 0; font-family: var(--font-sans);"
        @click="emit('mark-all-read')"
      >
        <CheckCheck :size="13" />
        Marcar todas lidas
      </button>
    </div>

    <!-- Loading skeletons -->
    <template v-if="loading">
      <div v-for="i in 3" :key="i" style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-bottom: 0.5px solid var(--border-subtle);">
        <UiSkeleton width="28px" height="28px" rounded="8px" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
          <UiSkeleton width="60%" height="12px" />
          <UiSkeleton width="85%" height="11px" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="notifications.length === 0" style="padding: 28px 14px; text-align: center; font-size: 13px; color: var(--text-muted);">
      Nenhuma notificação
    </div>

    <!-- Notifications list -->
    <template v-else>
      <div
        v-for="n in notifications"
        :key="n.id"
        class="notif-row"
        style="display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px; border-bottom: 0.5px solid var(--border-subtle); transition: background 100ms; cursor: pointer;"
        :style="{ background: n.read_at ? 'transparent' : 'rgba(255,255,255,0.02)' }"
        @click="!n.read_at && emit('mark-read', n.id)"
      >
        <span
          style="width: 28px; height: 28px; border-radius: 8px; flex: none; display: flex; align-items: center; justify-content: center;"
          :style="{ background: n.read_at ? 'var(--bg-input)' : `color-mix(in srgb, ${iconColorMap[n.type] ?? 'var(--text-muted)'} 12%, transparent)` }"
        >
          <component :is="iconMap[n.type as keyof typeof iconMap] ?? FileText" :size="14" :style="{ color: iconColorMap[n.type] ?? 'var(--text-muted)' }" />
        </span>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <span style="font-size: 12.5px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ n.data.title }}</span>
            <span style="font-size: 11px; color: var(--text-muted); flex: none;">{{ timeAgo(n.created_at) }}</span>
          </div>
          <p style="font-size: 11.5px; color: var(--text-tertiary); margin: 0; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ n.data.body }}</p>
        </div>
        <span v-if="!n.read_at" style="width: 6px; height: 6px; border-radius: 999px; background: var(--red-500); flex: none; margin-top: 4px;" />
      </div>
    </template>

    <!-- Footer -->
    <NuxtLink
      to="/notifications"
      class="notif-footer"
      style="display: block; text-align: center; padding: 10px; font-size: 12.5px; color: var(--text-muted); text-decoration: none; transition: color 100ms, background 100ms;"
      @click="emit('close')"
    >
      Ver todas as notificações →
    </NuxtLink>
  </div>
</template>

<style scoped>
.notif-row:hover { background: var(--bg-row-hover) !important; }
.notif-footer:hover { color: var(--text-primary) !important; }
</style>
