<!-- app/components/mobile/FinanceReportsMobile.vue -->
<script setup lang="ts">
import { paymentRequestsService, type PaymentRequest } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'
import { CURRENCIES } from '~/config/constants'

const toast = useToast()
const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const all = ref<PaymentRequest[]>([])
const loading = ref(true)

const metrics = computed(() => {
  const approved = all.value.filter(r => r.status === 'approved')
  const rejected = all.value.filter(r => r.status === 'rejected')
  const pending  = all.value.filter(r => r.status === 'pending')
  const resolved = approved.length + rejected.length
  return {
    totalEur:     approved.reduce((s, r) => s + Number(r.amount_eur), 0),
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    pendingCount:  pending.length,
    approvalRate:  resolved > 0 ? Math.round((approved.length / resolved) * 100) : 0,
  }
})

const byCurrency = computed(() => {
  const map = new Map<string, number>()
  for (const req of all.value.filter(r => r.status === 'approved')) {
    map.set(req.currency, (map.get(req.currency) ?? 0) + Number(req.amount_eur))
  }
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([currency, eur]) => ({
    currency,
    flag: CURRENCY_FLAG[currency] ?? '',
    eur,
    pct: Math.round((eur / max) * 100),
  }))
})

const byEmployee = computed(() => {
  const map = new Map<string, number>()
  for (const req of all.value.filter(r => r.status === 'approved')) {
    const name = req.user?.name ?? 'Desconhecido'
    map.set(name, (map.get(name) ?? 0) + Number(req.amount_eur))
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, eur]) => ({ name, eur }))
})

async function fetchRequests() {
  loading.value = true
  try {
    all.value = await paymentRequestsService.list()
  } catch {
    toast.error('Erro ao carregar relatórios.')
  } finally {
    loading.value = false
  }
}

onMounted(fetchRequests)
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
        v-for="({ label, value, tone }) in loading ? Array(4).fill({}) : [
          { label: 'Total aprovado',  value: formatEur(metrics.totalEur),     tone: 'var(--status-approved-fg)' },
          { label: 'Requisições',     value: String(metrics.approvedCount + metrics.rejectedCount), tone: 'var(--text-primary)' },
          { label: 'Total rejeitado', value: `${metrics.rejectedCount} req`,   tone: 'var(--status-rejected-fg)' },
          { label: 'Taxa aprovação',  value: `${metrics.approvalRate}%`,       tone: 'var(--text-primary)' },
        ]"
        :key="label"
        style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 13px; padding: 13px 14px;"
      >
        <template v-if="loading">
          <UiSkeleton width="60%" height="20px" rounded="4px" />
        </template>
        <template v-else>
          <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 500; line-height: 1;" :style="{ color: tone }">{{ value }}</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px;">{{ label }}</div>
        </template>
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
          v-for="(row, i) in byCurrency"
          :key="row.currency"
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px;"
          :style="{ borderBottom: i < byCurrency.length - 1 ? '0.5px solid var(--border-subtle)' : 'none' }"
        >
          <span style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-secondary);">
            {{ row.flag }} {{ row.currency }}
          </span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 64px; height: 3px; background: var(--border-strong); border-radius: 999px; overflow: hidden;">
              <div style="height: 100%; background: var(--red-500); border-radius: 999px; transition: width 400ms ease;" :style="{ width: `${row.pct}%` }" />
            </div>
            <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">{{ formatEur(row.eur) }}</span>
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
          <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">{{ formatEur(emp.eur) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>
