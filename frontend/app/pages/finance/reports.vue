<script setup lang="ts">
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { useAuthStore } from '~/stores/auth'
import { paymentRequestsService, type PaymentRequest } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'
import { CURRENCIES } from '~/config/constants'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const toast = useToast()

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const nav = computed(() => [
  { label: 'Fila de aprovação', to: '/finance' },
  { label: 'Histórico', to: '/finance/history' },
  { label: 'Relatórios', to: '/finance/reports', active: true },
])

const all = ref<PaymentRequest[]>([])
const loading = ref(false)

const metrics = computed(() => {
  const approved = all.value.filter(r => r.status === 'approved')
  const rejected = all.value.filter(r => r.status === 'rejected')
  const pending  = all.value.filter(r => r.status === 'pending')
  const resolved = approved.length + rejected.length

  return {
    totalEur:     approved.reduce((s, r) => s + r.amount_eur, 0),
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    pendingCount:  pending.length,
    approvalRate:  resolved > 0 ? Math.round((approved.length / resolved) * 100) : 0,
  }
})

const byCurrency = computed(() => {
  const map = new Map<string, { approved: number; rejected: number; eurApproved: number }>()
  for (const req of all.value) {
    if (!map.has(req.currency)) map.set(req.currency, { approved: 0, rejected: 0, eurApproved: 0 })
    const e = map.get(req.currency)!
    if (req.status === 'approved') { e.approved++; e.eurApproved += req.amount_eur }
    else if (req.status === 'rejected') e.rejected++
  }
  return [...map.entries()]
    .map(([currency, s]) => ({ currency, ...s }))
    .sort((a, b) => b.eurApproved - a.eurApproved)
})

const byEmployee = computed(() => {
  const map = new Map<string, { approved: number; rejected: number; eurApproved: number }>()
  for (const req of all.value.filter(r => r.status === 'approved' || r.status === 'rejected')) {
    const name = req.user?.name ?? 'Desconhecido'
    if (!map.has(name)) map.set(name, { approved: 0, rejected: 0, eurApproved: 0 })
    const e = map.get(name)!
    if (req.status === 'approved') { e.approved++; e.eurApproved += req.amount_eur }
    else e.rejected++
  }
  return [...map.entries()]
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.eurApproved - a.eurApproved)
})

// Doughnut: status distribution
const donutData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Aprovadas', 'Rejeitadas', 'Expiradas', 'Pendentes'],
  datasets: [{
    data: [
      metrics.value.approvedCount,
      metrics.value.rejectedCount,
      all.value.filter(r => r.status === 'expired').length,
      metrics.value.pendingCount,
    ],
    backgroundColor: ['#22c55e33', '#ef444433', '#71717a33', '#f59e0b33'],
    borderColor:     ['#22c55e',   '#ef4444',   '#71717a',   '#f59e0b'],
    borderWidth: 1.5,
    hoverOffset: 6,
  }],
}))

const donutOptions: ChartOptions<'doughnut'> = {
  cutout: '70%',
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: 10 },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9ca3af',
        font: { size: 12 },
        padding: 16,
        boxWidth: 10,
        boxHeight: 10,
      },
    },
    tooltip: {
      backgroundColor: '#1a1a1a',
      titleColor: '#f3f4f6',
      bodyColor: '#9ca3af',
      borderColor: '#2a2a2a',
      borderWidth: 1,
    },
  },
}

// Bar: EUR approved by currency
const barData = computed<ChartData<'bar'>>(() => ({
  labels: byCurrency.value.map(r => `${CURRENCY_FLAG[r.currency] ?? ''} ${r.currency}`),
  datasets: [{
    label: 'Aprovado (EUR)',
    data: byCurrency.value.map(r => r.eurApproved),
    backgroundColor: '#CC000033',
    borderColor: '#CC0000',
    borderWidth: 1.5,
    borderRadius: 4,
    borderSkipped: false,
  }],
}))

const barOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a1a',
      titleColor: '#f3f4f6',
      bodyColor: '#9ca3af',
      borderColor: '#2a2a2a',
      borderWidth: 1,
      callbacks: {
        label: ctx => ` € ${Number(ctx.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: '#ffffff08' },
      ticks: { color: '#9ca3af', font: { size: 12 } },
    },
    y: {
      grid: { color: '#ffffff08' },
      ticks: {
        color: '#9ca3af',
        font: { size: 11 },
        callback: val => `€ ${Number(val).toLocaleString('pt-BR', { notation: 'compact' })}`,
      },
    },
  },
}

async function fetch() {
  loading.value = true
  try {
    all.value = await paymentRequestsService.list()
  } catch {
    toast.error('Erro ao carregar relatórios.')
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
</script>

<template>
  <div>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 1180px; margin: 0 auto;">
      <h1 class="font-medium mb-1" style="font-size: 22px; color: var(--text-primary);">Relatórios</h1>
      <p class="text-sm mb-6" style="color: var(--text-tertiary);">Resumo consolidado das requisições de pagamento.</p>

      <div v-if="loading" class="py-10 text-center text-sm" style="color: var(--text-muted);">Carregando...</div>

      <template v-else>
        <!-- KPI cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 mb-7" style="gap: 14px;">
          <UiMetricCard
            label="Total aprovado"
            :value="formatEur(metrics.totalEur)"
            sub="valor liberado em EUR"
            :accent="true"
          />
          <UiMetricCard
            label="Aprovadas"
            :value="String(metrics.approvedCount)"
            tone="approved"
            sub="requisições"
          />
          <UiMetricCard
            label="Rejeitadas"
            :value="String(metrics.rejectedCount)"
            tone="rejected"
            sub="requisições"
          />
          <UiMetricCard
            label="Taxa de aprovação"
            :value="`${metrics.approvalRate}%`"
            sub="aprovadas vs revisadas"
          />
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 mb-5" style="gap: 18px;">
          <!-- Doughnut: distribuição por status -->
          <UiCard :overflow="false">
            <p class="text-sm font-medium mb-4" style="color: var(--text-primary);">Distribuição por status</p>
            <div style="height: 260px; padding: 8px 8px 0;">
              <ClientOnly>
                <Doughnut :data="donutData" :options="donutOptions" />
              </ClientOnly>
            </div>
          </UiCard>

          <!-- Bar: EUR por moeda -->
          <UiCard style="grid-column: span 2;">
            <p class="text-sm font-medium mb-4" style="color: var(--text-primary);">Valor aprovado por moeda (EUR)</p>
            <div style="height: 260px;">
              <ClientOnly>
                <Bar :data="barData" :options="barOptions" />
              </ClientOnly>
            </div>
          </UiCard>
        </div>

        <!-- Tables row -->
        <div class="grid grid-cols-1 lg:grid-cols-2" style="gap: 18px;">
          <!-- By currency -->
          <UiCard :padded="false">
            <div
              class="text-sm font-medium"
              style="padding: 16px 20px; border-bottom: 0.5px solid var(--border-subtle); color: var(--text-primary);"
            >Detalhamento por moeda</div>

            <div v-if="byCurrency.length === 0" class="py-8 text-center text-sm" style="color: var(--text-muted);">Sem dados.</div>

            <table v-else class="w-full" style="border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                  <th v-for="h in ['Moeda', 'Aprovadas', 'Rejeitadas', 'Total EUR']" :key="h"
                    class="text-left font-medium"
                    style="padding: 10px 16px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);"
                  >{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in byCurrency" :key="row.currency"
                  :style="{ borderBottom: i < byCurrency.length - 1 ? '0.5px solid var(--border-subtle)' : 'none' }">
                  <td style="padding: 12px 16px; font-size: 14px; color: var(--text-primary);">
                    <span class="inline-flex items-center" style="gap: 6px;">
                      <span style="font-size: 15px;">{{ CURRENCY_FLAG[row.currency] ?? '' }}</span>
                      {{ row.currency }}
                    </span>
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: var(--status-approved-fg);">{{ row.approved }}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: var(--status-rejected-fg);">{{ row.rejected }}</td>
                  <td style="padding: 12px 16px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); font-weight: 500;">
                    {{ formatEur(row.eurApproved) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </UiCard>

          <!-- By employee -->
          <UiCard :padded="false">
            <div
              class="text-sm font-medium"
              style="padding: 16px 20px; border-bottom: 0.5px solid var(--border-subtle); color: var(--text-primary);"
            >Detalhamento por funcionário</div>

            <div v-if="byEmployee.length === 0" class="py-8 text-center text-sm" style="color: var(--text-muted);">Sem dados.</div>

            <table v-else class="w-full" style="border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                  <th v-for="h in ['Funcionário', 'Aprovadas', 'Rejeitadas', 'Total EUR']" :key="h"
                    class="text-left font-medium"
                    style="padding: 10px 16px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);"
                  >{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in byEmployee" :key="row.name"
                  :style="{ borderBottom: i < byEmployee.length - 1 ? '0.5px solid var(--border-subtle)' : 'none' }">
                  <td style="padding: 12px 16px; font-size: 14px; color: var(--text-primary); font-weight: 500;">{{ row.name }}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: var(--status-approved-fg);">{{ row.approved }}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: var(--status-rejected-fg);">{{ row.rejected }}</td>
                  <td style="padding: 12px 16px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); font-weight: 500;">
                    {{ formatEur(row.eurApproved) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </UiCard>
        </div>
      </template>
    </main>
  </div>
</template>
