<script setup lang="ts">
import { useDashboardController } from '~/composables/useDashboardController'
import { useT } from '~/composables/useT'
import { CURRENCIES } from '~/config/constants'

definePageMeta({ middleware: 'auth' })

const isMobile = useIsMobile()
const { t } = useT()

const {
  auth, requests, loading,
  page, meta, setPage,
  totalMetric, totalLoading,
  pendingMetric, pendingLoading,
  approvedMetric, approvedLoading,
  rejectedMetric, rejectedLoading,
  formatEur, formatDate, goToDetail,
} = useDashboardController()

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const nav = computed(() => [
  { label: t('nav.dashboard'), to: '/', active: true },
  { label: t('nav.requests'), to: '/requests/new' },
  { label: t('nav.history'), to: '/history' },
])

const tableHeaders = computed(() => [
  t('home.table.description'),
  t('home.table.localValue'),
  t('home.table.currency'),
  t('home.table.inEur'),
  t('home.table.date'),
  t('home.table.status'),
])
</script>

<template>
  <HomeMobile v-if="isMobile" />
  <div v-else>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 1180px; margin: 0 auto;">
      <!-- Page header -->
      <div class="flex items-end justify-between mb-6">
        <div>
          <h1 class="text-white font-medium" style="font-size: 22px;">{{ t('home.greeting', { name: auth.user?.name?.split(' ')[0] ?? '' }) }}</h1>
          <p class="text-sm mt-1" style="color: var(--text-tertiary);">{{ t('home.subtitle') }}</p>
        </div>
        <NuxtLink to="/requests/new">
          <UiButton variant="primary" size="sm">{{ t('home.newRequest') }}</UiButton>
        </NuxtLink>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-7" style="gap: 14px;">
        <UiMetricCard
          :label="t('home.totalSent')"
          :value="totalMetric?.amount ?? 0"
          prefix="€ "
          :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          :sub-value="totalMetric?.count ?? 0"
          :sub-suffix="(totalMetric?.count ?? 0) === 1 ? t('home.request') : t('home.requests')"
          :accent="true"
          :loading="totalLoading"
        />
        <UiMetricCard
          :label="t('home.pending')"
          :value="pendingMetric?.count ?? 0"
          :sub-value="pendingMetric?.amount ?? 0"
          sub-prefix="€ "
          :sub-format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          :sub-suffix="t('home.inReview')"
          tone="pending"
          :loading="pendingLoading"
        />
        <UiMetricCard
          :label="t('home.approved')"
          :value="approvedMetric?.count ?? 0"
          :sub-value="approvedMetric?.amount ?? 0"
          sub-prefix="€ "
          :sub-format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          :sub-suffix="t('home.released')"
          tone="approved"
          :loading="approvedLoading"
        />
        <UiMetricCard
          :label="t('home.rejected')"
          :value="rejectedMetric?.count ?? 0"
          :sub-value="rejectedMetric?.amount ?? 0"
          sub-prefix="€ "
          :sub-format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          :sub-suffix="t('home.refused')"
          tone="rejected"
          :loading="rejectedLoading"
        />
      </div>

      <!-- Requests table -->
      <UiCard :padded="false">
        <div
          class="text-sm font-medium"
          style="padding: 16px 20px; border-bottom: 0.5px solid var(--border-subtle); color: var(--text-primary);"
        >{{ t('home.recentRequests') }}</div>

        <div v-if="loading" class="overflow-x-auto">
          <table class="w-full" style="border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                <th v-for="h in tableHeaders" :key="h"
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

        <div v-else-if="requests.length === 0" class="py-10 text-center text-sm" style="color: var(--text-muted);">{{ t('home.empty') }}</div>

        <div v-else class="overflow-x-auto">
          <table class="w-full" style="border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                <th
                  v-for="h in tableHeaders"
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
                    <span v-if="CURRENCY_FLAG[req.currency]" :class="`fi fi-${CURRENCY_FLAG[req.currency]}`" style="width: 18px; height: 14px; border-radius: 2px;" />
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

        <UiPagination
          :current-page="meta.current_page"
          :last-page="meta.last_page"
          :loading="loading"
          @change="setPage"
        />
      </UiCard>
    </main>
  </div>
</template>
