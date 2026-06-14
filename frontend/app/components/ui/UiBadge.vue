<!-- frontend/components/ui/UiBadge.vue -->
<script setup lang="ts">
import { useT } from '~/composables/useT'

type Status = 'pending' | 'approved' | 'rejected' | 'expired' | 'neutral'

const props = withDefaults(defineProps<{
  status?: Status
  dot?: boolean
}>(), {
  status: 'neutral',
  dot: true,
})

const { t } = useT()

const labels = computed<Record<Status, string>>(() => ({
  pending:  t('shared.status.pending'),
  approved: t('shared.status.approved'),
  rejected: t('shared.status.rejected'),
  expired:  t('shared.status.expired'),
  neutral:  '',
}))

const styles: Record<Status, { color: string; bg: string; border: string; dotShadow: string | null }> = {
  pending:  { color: 'var(--status-pending-fg)',  bg: 'var(--status-pending-bg)',  border: 'var(--status-pending-border)',  dotShadow: '0 0 5px 1px rgba(245,165,36,0.55)' },
  approved: { color: 'var(--status-approved-fg)', bg: 'var(--status-approved-bg)', border: 'var(--status-approved-border)', dotShadow: '0 0 5px 1px rgba(43,189,110,0.55)' },
  rejected: { color: 'var(--status-rejected-fg)', bg: 'var(--status-rejected-bg)', border: 'var(--status-rejected-border)', dotShadow: '0 0 5px 1px rgba(240,68,68,0.55)' },
  expired:  { color: 'var(--status-expired-fg)',  bg: 'var(--status-expired-bg)',  border: 'var(--status-expired-border)',  dotShadow: null },
  neutral:  { color: 'var(--text-secondary)',      bg: 'var(--bg-input)',            border: 'var(--border-default)',          dotShadow: null },
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-sm text-xs font-medium font-sans whitespace-nowrap"
    :style="{
      color: styles[status].color,
      background: styles[status].bg,
      border: `0.5px solid ${styles[status].border}`,
    }"
  >
    <span
      v-if="dot"
      class="pv-badge-dot w-1.5 h-1.5 rounded-full flex-none"
      :style="{ background: styles[status].color, boxShadow: styles[status].dotShadow ?? undefined }"
    />
    <slot>{{ labels[status] }}</slot>
  </span>
</template>
