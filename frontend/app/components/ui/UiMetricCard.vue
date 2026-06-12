<!-- frontend/components/ui/UiMetricCard.vue -->
<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { cn } from '~/utils/cn'

type Tone = 'default' | 'pending' | 'approved' | 'rejected'

withDefaults(defineProps<{
  label: string
  value: number
  sub?: string
  prefix?: string
  formatOptions?: Intl.NumberFormatOptions
  subValue?: number
  subPrefix?: string
  subFormatOptions?: Intl.NumberFormatOptions
  subSuffix?: string
  accent?: boolean
  tone?: Tone
  loading?: boolean
}>(), {
  tone: 'default',
  accent: false,
  loading: false,
  value: 0,
  subValue: 0,
})

const toneColor: Record<Tone, string> = {
  default:  'var(--text-primary)',
  pending:  'var(--status-pending-fg)',
  approved: 'var(--status-approved-fg)',
  rejected: 'var(--status-rejected-fg)',
}
</script>

<template>
  <div
    class="relative rounded-md px-5 py-[18px] flex flex-col gap-2.5 overflow-hidden"
    style="background: var(--surface-card); border: 0.5px solid var(--border-subtle);"
  >
    <span v-if="accent" class="absolute left-0 top-0 bottom-0 w-0.5" style="background: var(--red-500);" />
    <span class="text-xs font-medium font-sans" style="color: var(--text-tertiary);">{{ label }}</span>

    <!-- Valor principal -->
    <div :class="{ 'metric-pulse': loading }">
      <ClientOnly>
        <NumberFlow
          :value="loading ? 0 : value"
          :prefix="prefix"
          :format="formatOptions"
          locales="pt-BR"
          class="font-mono font-medium text-[28px] leading-none tabular-nums"
          :style="{ letterSpacing: '-0.02em', color: toneColor[tone] }"
        />
        <template #fallback>
          <span
            class="font-mono font-medium text-[28px] leading-none tabular-nums"
            :style="{ letterSpacing: '-0.02em', color: toneColor[tone] }"
          >{{ prefix ?? '' }}0{{ formatOptions?.minimumFractionDigits ? ',00' : '' }}</span>
        </template>
      </ClientOnly>
    </div>

    <span v-if="sub" class="text-xs font-sans" style="color: var(--text-muted);">{{ sub }}</span>

    <!-- Sub-texto com número animado -->
    <div
      v-if="subSuffix !== undefined"
      :class="cn('flex items-baseline text-xs font-sans', loading && 'metric-pulse')"
      style="color: var(--text-muted); gap: 3px;"
    >
      <ClientOnly>
        <NumberFlow
          :value="loading ? 0 : (subValue ?? 0)"
          :prefix="subPrefix"
          :format="subFormatOptions"
          locales="pt-BR"
          class="text-xs font-sans tabular-nums"
          style="color: var(--text-muted);"
        />
        <template #fallback>
          <span>{{ subPrefix ?? '' }}0{{ subFormatOptions?.minimumFractionDigits ? ',00' : '' }}</span>
        </template>
      </ClientOnly>
      <span>{{ subSuffix }}</span>
    </div>
  </div>
</template>

<style scoped>
.metric-pulse {
  animation: metric-pulse 1.5s ease-in-out infinite;
}

@keyframes metric-pulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 0.2; }
}
</style>
