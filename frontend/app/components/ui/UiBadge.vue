<!-- frontend/components/ui/UiBadge.vue -->
<script setup lang="ts">
type Status = 'pending' | 'approved' | 'rejected' | 'expired' | 'neutral'

const props = withDefaults(defineProps<{
  status?: Status
  dot?: boolean
}>(), {
  status: 'neutral',
  dot: true,
})

const labels: Record<Status, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  expired: 'Expirado',
  neutral: '',
}

const styles: Record<Status, { color: string; bg: string; border: string }> = {
  pending:  { color: 'var(--status-pending-fg)',  bg: 'var(--status-pending-bg)',  border: 'var(--status-pending-border)' },
  approved: { color: 'var(--status-approved-fg)', bg: 'var(--status-approved-bg)', border: 'var(--status-approved-border)' },
  rejected: { color: 'var(--status-rejected-fg)', bg: 'var(--status-rejected-bg)', border: 'var(--status-rejected-border)' },
  expired:  { color: 'var(--status-expired-fg)',  bg: 'var(--status-expired-bg)',  border: 'var(--status-expired-border)' },
  neutral:  { color: 'var(--text-secondary)',      bg: 'var(--bg-input)',            border: 'var(--border-default)' },
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
      :style="{ background: styles[status].color }"
    />
    <slot>{{ labels[status] }}</slot>
  </span>
</template>
