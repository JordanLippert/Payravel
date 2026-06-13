<!-- frontend/app/components/ui/UiNotificationDrawer.vue -->
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
  <Teleport to="body">
    <div style="position: fixed; inset: 0; z-index: 200;">
      <!-- Backdrop -->
      <div
        style="position: absolute; inset: 0; background: rgba(0,0,0,0.5);"
        @click="emit('close')"
      />

      <!-- Sheet -->
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--bg-surface); border-radius: 18px 18px 0 0; overflow: hidden; max-height: 75dvh; display: flex; flex-direction: column;">

        <!-- Handle -->
        <div style="display: flex; justify-content: center; padding: 10px 0 4px;">
          <div style="width: 36px; height: 4px; border-radius: 999px; background: var(--border-strong);" />
        </div>

        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 16px 12px; border-bottom: 0.5px solid var(--border-subtle);">
          <span style="font-size: 15px; font-weight: 500; color: var(--text-primary);">Notificações</span>
          <button
            type="button"
            style="display: flex; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; font-size: 12px; color: var(--text-muted); font-family: var(--font-sans); padding: 0;"
            @click="emit('mark-all-read')"
          >
            <CheckCheck :size="13" />
            Marcar todas lidas
          </button>
        </div>

        <!-- Content -->
        <div style="overflow-y: auto; flex: 1;">
          <template v-if="loading">
            <div v-for="i in 3" :key="i" style="display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; border-bottom: 0.5px solid var(--border-subtle);">
              <UiSkeleton width="32px" height="32px" rounded="10px" />
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                <UiSkeleton width="60%" height="13px" />
                <UiSkeleton width="85%" height="11px" />
              </div>
            </div>
          </template>

          <div v-else-if="notifications.length === 0" style="padding: 40px 16px; text-align: center; font-size: 13px; color: var(--text-muted);">
            Nenhuma notificação
          </div>

          <template v-else>
            <div
              v-for="n in notifications"
              :key="n.id"
              style="display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; border-bottom: 0.5px solid var(--border-subtle); cursor: pointer;"
              :style="{ background: n.read_at ? 'transparent' : 'rgba(255,255,255,0.02)' }"
              @click="!n.read_at && emit('mark-read', n.id)"
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

        <!-- Footer -->
        <NuxtLink
          to="/notifications"
          style="display: block; text-align: center; padding: 14px 16px; font-size: 13px; color: var(--text-primary); text-decoration: none; border-top: 0.5px solid var(--border-subtle); font-weight: 500;"
          @click="emit('close')"
        >
          Ver todas as notificações →
        </NuxtLink>
      </div>
    </div>
  </Teleport>
</template>
