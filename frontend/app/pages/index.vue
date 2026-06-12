<script setup lang="ts">
import { useDashboardController } from '~/composables/useDashboardController'
import { CURRENCIES } from '~/config/constants'

definePageMeta({ middleware: 'auth' })

const {
  auth, requests, loading,
  totalMetric, totalLoading,
  pendingMetric, pendingLoading,
  approvedMetric, approvedLoading,
  rejectedMetric, rejectedLoading,
  formatEur, formatDate, goToDetail,
} = useDashboardController()

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const nav = computed(() => [
  { label: 'Dashboard', to: '/', active: true },
  { label: 'Requisições', to: '/requests/new' },
  { label: 'Histórico', to: '/history' },
])
</script>

<template>
  <div>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 1180px; margin: 0 auto;">
      <!-- Page header -->
      <div class="flex items-end justify-between mb-6">
        <div>
          <h1 class="text-white font-medium" style="font-size: 22px;">Olá, {{ auth.user?.name?.split(' ')[0] }}</h1>
          <p class="text-sm mt-1" style="color: var(--text-tertiary);">Suas requisições de pagamento deste mês.</p>
        </div>
        <NuxtLink to="/requests/new">
          <UiButton variant="primary" size="sm">+ Nova requisição</UiButton>
        </NuxtLink>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-7" style="gap: 14px;">
        <UiMetricCard
          label="Total enviado"
          :value="totalMetric?.amount ?? 0"
          prefix="€ "
          :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          :sub-value="totalMetric?.count ?? 0"
          :sub-suffix="(totalMetric?.count ?? 0) === 1 ? 'requisição' : 'requisições'"
          :accent="true"
          :loading="totalLoading"
        />
        <UiMetricCard
          label="Pendente"
          :value="pendingMetric?.count ?? 0"
          :sub-value="pendingMetric?.amount ?? 0"
          sub-prefix="€ "
          :sub-format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          sub-suffix="em revisão"
          tone="pending"
          :loading="pendingLoading"
        />
        <UiMetricCard
          label="Aprovado"
          :value="approvedMetric?.count ?? 0"
          :sub-value="approvedMetric?.amount ?? 0"
          sub-prefix="€ "
          :sub-format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          sub-suffix="liberados"
          tone="approved"
          :loading="approvedLoading"
        />
        <UiMetricCard
          label="Rejeitado"
          :value="rejectedMetric?.count ?? 0"
          :sub-value="rejectedMetric?.amount ?? 0"
          sub-prefix="€ "
          :sub-format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          sub-suffix="recusados"
          tone="rejected"
          :loading="rejectedLoading"
        />
      </div>

      <!-- Requests table -->
      <UiCard :padded="false">
        <div
          class="text-sm font-medium"
          style="padding: 16px 20px; border-bottom: 0.5px solid var(--border-subtle); color: var(--text-primary);"
        >Requisições recentes</div>

        <div v-if="loading" class="overflow-x-auto">
          <table class="w-full" style="border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                <th v-for="h in ['Descrição', 'Valor local', 'Moeda', 'Em EUR', 'Data', 'Status']" :key="h"
                  class="text-left font-medium"
                  style="padding: 10px 16px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);"
                >{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(w, i) in ['58%','72%','48%','65%','54%']" :key="i"
                :style="{ borderBottom: i < 4 ? '0.5px solid var(--border-subtle)' : 'none' }"
              >
                <td style="padding: 14px 16px;"><UiSkeleton :width="w" /></td>
                <td style="padding: 14px 16px;"><div class="flex justify-end"><UiSkeleton width="72px" /></div></td>
                <td style="padding: 14px 16px;"><UiSkeleton width="48px" /></td>
                <td style="padding: 14px 16px;"><div class="flex justify-end"><UiSkeleton width="80px" /></div></td>
                <td style="padding: 14px 16px;"><UiSkeleton width="90px" /></td>
                <td style="padding: 14px 16px;"><UiSkeleton width="65px" height="22px" rounded="999px" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="requests.length === 0" class="py-10 text-center text-sm" style="color: var(--text-muted);">Nenhuma requisição encontrada.</div>

        <div v-else class="overflow-x-auto">
          <table class="w-full" style="border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                <th
                  v-for="h in ['Descrição', 'Valor local', 'Moeda', 'Em EUR', 'Data', 'Status']"
                  :key="h"
                  class="text-left font-medium"
                  style="padding: 10px 16px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);"
                >{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(req, i) in requests"
                :key="req.id"
                class="cursor-pointer"
                :style="{
                  borderBottom: i < requests.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
                  transition: 'background 120ms ease',
                }"
                @click="goToDetail(req.id)"
                @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--bg-row-hover)'"
                @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
              >
                <td style="padding: 14px 16px; font-size: 14px; color: var(--text-primary); font-weight: 500;">{{ req.description }}</td>
                <td style="padding: 14px 16px; font-size: 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--text-secondary);">
                  {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(req.amount_local) }}
                </td>
                <td style="padding: 14px 16px; font-size: 14px; color: var(--text-secondary);">
                  <span class="inline-flex items-center" style="gap: 6px;">
                    <span style="font-size: 15px;">{{ CURRENCY_FLAG[req.currency] ?? '' }}</span>
                    {{ req.currency }}
                  </span>
                </td>
                <td style="padding: 14px 16px; font-size: 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--text-primary); font-weight: 500;">{{ formatEur(req.amount_eur) }}</td>
                <td style="padding: 14px 16px; font-size: 13px; color: var(--text-tertiary); white-space: nowrap;">{{ formatDate(req.created_at) }}</td>
                <td style="padding: 14px 16px;">
                  <UiBadge :status="req.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </main>
  </div>
</template>
