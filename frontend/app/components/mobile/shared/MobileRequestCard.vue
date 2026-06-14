<!-- app/components/mobile/shared/MobileRequestCard.vue -->
<script setup lang="ts">
import type { PaymentRequest } from '~/services/paymentRequestsService'
import { CURRENCIES } from '~/config/constants'
import { useT } from '~/composables/useT'

const props = defineProps<{
  request: PaymentRequest
  showEmployee?: boolean
}>()

const { t } = useT()

const emit = defineEmits<{ click: [] }>()

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const flag = computed(() => CURRENCY_FLAG[props.request.currency] ?? '')

const localFormatted = computed(() =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(props.request.amount_local)
)

const eurFormatted = computed(() =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(props.request.amount_eur))
)

const metaLine = computed(() => {
  if (props.showEmployee) return props.request.user?.name ?? '—'
  const shortId = `PR-${props.request.id.slice(0, 6).toUpperCase()}`
  const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(new Date(props.request.created_at))
    .replace('.', '')
  return `${shortId} · ${date}`
})
</script>

<template>
  <button
    type="button"
    class="w-full text-left cursor-pointer flex flex-col"
    style="
      background: var(--surface-card, var(--bg-elevated));
      border: 0.5px solid var(--border-subtle);
      border-radius: 16px;
      padding: 14px;
      gap: 10px;
      font-family: var(--font-sans);
    "
    @click="emit('click')"
  >
    <!-- top row: flag + desc + status -->
    <div class="flex items-center" style="gap: 10px;">
      <span style="width: 38px; height: 38px; border-radius: 11px; flex: none; background: var(--bg-input); border: 0.5px solid var(--border-default); display: flex; align-items: center; justify-content: center;">
        <span v-if="flag" :class="`fi fi-${flag}`" style="width: 22px; height: 16px; border-radius: 2px;" />
      </span>
      <div class="flex-1 min-w-0">
        <div style="font-size: 14px; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {{ request.description }}
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
          {{ metaLine }}
        </div>
      </div>
      <UiBadge :status="request.status" style="border-radius: 999px; flex: none;" />
    </div>

    <!-- divider -->
    <div style="height: 0.5px; background: var(--border-subtle);" />

    <!-- amounts -->
    <div class="flex items-end justify-between">
      <div>
        <div style="font-size: 11px; color: var(--text-muted);">{{ request.currency }} · {{ t('shared.card.localValue') }}</div>
        <div style="font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); font-variant-numeric: tabular-nums; margin-top: 2px;">
          {{ localFormatted }}
        </div>
      </div>
      <div class="text-right">
        <div style="font-size: 11px; color: var(--text-muted);">{{ t('shared.card.inEur') }}</div>
        <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 500; color: var(--text-primary); font-variant-numeric: tabular-nums; margin-top: 2px;">
          € {{ eurFormatted }}
        </div>
      </div>
    </div>
  </button>
</template>
