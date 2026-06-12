<!-- frontend/components/ui/UiMetricCard.vue -->
<script setup lang="ts">
type Tone = 'default' | 'pending' | 'approved' | 'rejected'

const props = withDefaults(defineProps<{
  label: string
  value: string
  sub?: string
  accent?: boolean
  tone?: Tone
}>(), {
  tone: 'default',
  accent: false,
})

const toneColor: Record<Tone, string> = {
  default: 'var(--text-primary)',
  pending: 'var(--status-pending-fg)',
  approved: 'var(--status-approved-fg)',
  rejected: 'var(--status-rejected-fg)',
}
</script>

<template>
  <div
    class="relative rounded-md px-5 py-[18px] flex flex-col gap-2.5 overflow-hidden"
    style="background: var(--surface-card); border: 0.5px solid var(--border-subtle);"
  >
    <span v-if="accent" class="pv-accent-strip absolute left-0 top-0 bottom-0 w-0.5" style="background: var(--red-500);" />
    <span class="text-xs font-medium font-sans" style="color: var(--text-tertiary);">{{ label }}</span>
    <span
      class="font-mono font-medium text-[28px] leading-none tabular-nums"
      :style="{ letterSpacing: '-0.02em', color: toneColor[tone] }"
    >{{ value }}</span>
    <span v-if="sub" class="text-xs font-sans" style="color: var(--text-muted);">{{ sub }}</span>
  </div>
</template>
