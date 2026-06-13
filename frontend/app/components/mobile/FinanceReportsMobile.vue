<!-- app/components/mobile/FinanceReportsMobile.vue -->
<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { paymentRequestsService, type ReportsSummary } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'
import { CURRENCIES } from '~/config/constants'

const toast = useToast()
const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const summary = ref<ReportsSummary | null>(null)
const loading = ref(true)

const metrics = computed(() => ({
  totalEur:      summary.value?.total_eur      ?? 0,
  approvedCount: summary.value?.approved_count ?? 0,
  rejectedCount: summary.value?.rejected_count ?? 0,
  approvalRate:  summary.value?.approval_rate  ?? 0,
}))

const byCurrency = computed(() => summary.value?.by_currency ?? [])
const byEmployee = computed(() => summary.value?.by_employee ?? [])

const byCurrencyWithPct = computed(() => {
  const entries = byCurrency.value
  const max = entries[0]?.eur_approved ?? 1
  return entries.map(r => ({
    ...r,
    flag: CURRENCY_FLAG[r.currency] ?? '',
    pct: Math.round((r.eur_approved / max) * 100),
  }))
})

async function fetchReports() {
  loading.value = true
  try {
    summary.value = await paymentRequestsService.reports()
  } catch {
    toast.error('Erro ao carregar relatórios.')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReports)
</script>

<template>
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 18px;">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div style="font-size: 11px; color: var(--text-muted);">Financeiro</div>
        <div style="font-size: 17px; font-weight: 500; color: var(--text-primary); margin-top: 1px;">Relatórios</div>
      </div>
    </div>

    <!-- Metrics 2x2 -->
    <div class="grid grid-cols-2" style="gap: 9px;">
      <div
        v-for="({ label, numericValue, prefix, formatOptions, tone }) in [
          { label: 'Total aprovado',  numericValue: metrics.totalEur,                              prefix: '€ ', formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 }, tone: 'var(--status-approved-fg)' },
          { label: 'Requisições',     numericValue: metrics.approvedCount + metrics.rejectedCount,  prefix: undefined, formatOptions: undefined,                                          tone: 'var(--text-primary)' },
          { label: 'Total rejeitado', numericValue: metrics.rejectedCount,                          prefix: undefined, formatOptions: undefined,                                          tone: 'var(--status-rejected-fg)' },
          { label: 'Taxa aprovação',  numericValue: metrics.approvalRate / 100,                     prefix: undefined, formatOptions: { style: 'percent', maximumFractionDigits: 0 },     tone: 'var(--text-primary)' },
        ]"
        :key="label"
        style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 13px; padding: 13px 14px;"
      >
        <ClientOnly>
          <NumberFlow
            :value="loading ? 0 : (numericValue ?? 0)"
            :prefix="prefix"
            :format="formatOptions"
            locales="pt-BR"
            class="font-mono font-medium tabular-nums"
            :class="{ 'metric-pulse': loading }"
            style="font-size: 18px; line-height: 1;"
            :style="{ color: tone }"
          />
          <template #fallback>
            <span class="font-mono font-medium tabular-nums" style="font-size: 18px; line-height: 1;" :style="{ color: tone }">
              {{ prefix ?? '' }}0
            </span>
          </template>
        </ClientOnly>
        <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px;">{{ label }}</div>
      </div>
    </div>

    <!-- Currencies -->
    <div>
      <div style="font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 10px;">Moedas mais usadas</div>
      <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 14px; overflow: hidden;">
        <template v-if="loading">
          <div v-for="i in 3" :key="i" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 0.5px solid var(--border-subtle);">
            <UiSkeleton width="60px" height="13px" />
            <UiSkeleton width="100px" height="4px" rounded="999px" />
          </div>
        </template>
        <div
          v-else
          v-for="(row, i) in byCurrencyWithPct"
          :key="row.currency"
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px;"
          :style="{ borderBottom: i < byCurrencyWithPct.length - 1 ? '0.5px solid var(--border-subtle)' : 'none' }"
        >
          <span style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-secondary);">
            {{ row.flag }} {{ row.currency }}
          </span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 64px; height: 3px; background: var(--border-strong); border-radius: 999px; overflow: hidden;">
              <div style="height: 100%; background: var(--red-500); border-radius: 999px; transition: width 400ms ease;" :style="{ width: `${row.pct}%` }" />
            </div>
            <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">{{ formatEur(row.eur_approved) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top employees -->
    <div>
      <div style="font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 10px;">Top solicitantes</div>
      <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 14px; overflow: hidden;">
        <template v-if="loading">
          <div v-for="i in 3" :key="i" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 0.5px solid var(--border-subtle);">
            <UiSkeleton width="100px" height="13px" />
            <UiSkeleton width="70px" height="13px" />
          </div>
        </template>
        <div
          v-else
          v-for="(emp, i) in byEmployee"
          :key="emp.name"
          style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px;"
          :style="{ borderBottom: i < byEmployee.length - 1 ? '0.5px solid var(--border-subtle)' : 'none' }"
        >
          <span style="font-size: 12.5px; color: var(--text-secondary);">{{ emp.name }}</span>
          <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">{{ formatEur(emp.eur_approved) }}</span>
        </div>
      </div>
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
