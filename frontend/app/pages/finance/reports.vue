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
import { paymentRequestsService, type ReportsSummary } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'
import { CURRENCIES } from '~/config/constants'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

definePageMeta({ middleware: 'auth' })
const isMobile = useIsMobile()

const auth = useAuthStore()
const toast = useToast()

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const nav = computed(() => [
  { label: 'Fila de aprovação', to: '/finance' },
  { label: 'Histórico', to: '/finance/history' },
  { label: 'Relatórios', to: '/finance/reports', active: true },
])

const summary = ref<ReportsSummary | null>(null)
const loading = ref(true)

const metrics = computed(() => ({
  totalEur:      summary.value?.total_eur      ?? 0,
  approvedCount: summary.value?.approved_count ?? 0,
  rejectedCount: summary.value?.rejected_count ?? 0,
  pendingCount:  summary.value?.pending_count  ?? 0,
  expiredCount:  summary.value?.expired_count  ?? 0,
  approvalRate:  summary.value?.approval_rate  ?? 0,
}))

const byCurrency = computed(() => summary.value?.by_currency ?? [])
const byEmployee = computed(() => summary.value?.by_employee ?? [])

// Doughnut: status distribution
const donutData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Aprovadas', 'Rejeitadas', 'Expiradas', 'Pendentes'],
  datasets: [{
    data: [
      metrics.value.approvedCount,
      metrics.value.rejectedCount,
      metrics.value.expiredCount,
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
  labels: byCurrency.value.map(r => r.currency),
  datasets: [{
    label: 'Aprovado (EUR)',
    data: byCurrency.value.map(r => r.eur_approved),
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
    summary.value = await paymentRequestsService.reports()
  } catch {
    toast.error('Erro ao carregar relatórios.')
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
</script>

<template>
  <FinanceReportsMobile v-if="isMobile" />

  <div v-else>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 1180px; margin: 0 auto;">
      <h1 class="font-medium mb-1" style="font-size: 22px; color: var(--text-primary);">Relatórios</h1>
      <p class="text-sm mb-6" style="color: var(--text-tertiary);">Resumo consolidado das requisições de pagamento.</p>

      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 mb-7" style="gap: 14px;">
        <UiMetricCard
          label="Total aprovado"
          :value="metrics.totalEur"
          prefix="€ "
          :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          sub="valor liberado em EUR"
          :accent="true"
          :loading="loading"
        />
        <UiMetricCard
          label="Aprovadas"
          :value="metrics.approvedCount"
          tone="approved"
          sub="requisições"
          :loading="loading"
        />
        <UiMetricCard
          label="Rejeitadas"
          :value="metrics.rejectedCount"
          tone="rejected"
          sub="requisições"
          :loading="loading"
        />
        <UiMetricCard
          label="Taxa de aprovação"
          :value="metrics.approvalRate / 100"
          :format-options="{ style: 'percent', maximumFractionDigits: 0 }"
          sub="aprovadas vs revisadas"
          :loading="loading"
        />
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 mb-5" style="gap: 18px;">
        <UiCard :overflow="false">
          <template v-if="loading">
            <UiSkeleton width="60%" height="13px" style="margin-bottom: 16px;" />
            <div style="height: 260px; display: flex; align-items: center; justify-content: center;">
              <UiSkeleton width="180px" height="180px" rounded="50%" />
            </div>
          </template>
          <template v-else>
            <p class="text-sm font-medium mb-4" style="color: var(--text-primary);">Distribuição por status</p>
            <div style="height: 260px; padding: 8px 8px 0;">
              <ClientOnly>
                <Doughnut :data="donutData" :options="donutOptions" />
              </ClientOnly>
            </div>
          </template>
        </UiCard>

        <UiCard style="grid-column: span 2;">
          <template v-if="loading">
            <UiSkeleton width="55%" height="13px" style="margin-bottom: 16px;" />
            <div style="height: 260px; display: flex; align-items: flex-end; gap: 12px; padding-bottom: 4px;">
              <UiSkeleton v-for="h in ['60%','85%','45%','70%','55%']" :key="h" width="14%" :height="h" />
            </div>
          </template>
          <template v-else>
            <p class="text-sm font-medium mb-4" style="color: var(--text-primary);">Valor aprovado por moeda (EUR)</p>
            <div style="height: 260px;">
              <ClientOnly>
                <Bar :data="barData" :options="barOptions" />
              </ClientOnly>
            </div>
          </template>
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

          <template v-if="loading">
            <table class="w-full" style="border-collapse: collapse;">
              <tbody>
                <tr v-for="(w, i) in ['55%','65%','50%','60%','52%']" :key="i"
                  :style="{ borderBottom: i < 4 ? '0.5px solid var(--border-subtle)' : 'none' }">
                  <td style="padding: 12px 16px;"><UiSkeleton :width="w" /></td>
                  <td style="padding: 12px 16px;"><UiSkeleton width="28px" /></td>
                  <td style="padding: 12px 16px;"><UiSkeleton width="28px" /></td>
                  <td style="padding: 12px 16px;"><div class="flex justify-end"><UiSkeleton width="72px" /></div></td>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
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
                      <span v-if="CURRENCY_FLAG[row.currency]" :class="`fi fi-${CURRENCY_FLAG[row.currency]}`" style="width: 18px; height: 14px; border-radius: 2px;" />
                      {{ row.currency }}
                    </span>
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: var(--status-approved-fg);">{{ row.approved }}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: var(--status-rejected-fg);">{{ row.rejected }}</td>
                  <td style="padding: 12px 16px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); font-weight: 500;">
                    {{ formatEur(row.eur_approved) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </UiCard>

        <!-- By employee -->
        <UiCard :padded="false">
          <div
            class="text-sm font-medium"
            style="padding: 16px 20px; border-bottom: 0.5px solid var(--border-subtle); color: var(--text-primary);"
          >Detalhamento por funcionário</div>

          <template v-if="loading">
            <table class="w-full" style="border-collapse: collapse;">
              <tbody>
                <tr v-for="(w, i) in ['60%','70%','55%','65%','50%']" :key="i"
                  :style="{ borderBottom: i < 4 ? '0.5px solid var(--border-subtle)' : 'none' }">
                  <td style="padding: 12px 16px;"><UiSkeleton :width="w" /></td>
                  <td style="padding: 12px 16px;"><UiSkeleton width="28px" /></td>
                  <td style="padding: 12px 16px;"><UiSkeleton width="28px" /></td>
                  <td style="padding: 12px 16px;"><div class="flex justify-end"><UiSkeleton width="72px" /></div></td>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
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
                    {{ formatEur(row.eur_approved) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </UiCard>
      </div>
    </main>
  </div>
</template>
