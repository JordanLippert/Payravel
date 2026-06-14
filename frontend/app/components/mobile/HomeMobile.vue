<!-- app/components/mobile/HomeMobile.vue -->
<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { useDashboardController } from '~/composables/useDashboardController'
import { useT } from '~/composables/useT'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const { t } = useT()
const {
  requests, loading,
  page, meta, setPage,
  statusFilter, setFilter,
  totalMetric, totalLoading,
  pendingMetric, pendingLoading, approvedMetric, approvedLoading, rejectedMetric, rejectedLoading,
  formatEur, formatDate,
} = useDashboardController()


type FilterValue = 'all' | 'pending' | 'approved' | 'rejected'

const filters = computed<{ value: FilterValue; label: string }[]>(() => [
  { value: 'all',      label: t('history.filtersMobile.all') },
  { value: 'pending',  label: t('history.filtersMobile.pending') },
  { value: 'approved', label: t('history.filtersMobile.approved') },
  { value: 'rejected', label: t('history.filtersMobile.rejected') },
])

const activeFilter = computed(() => (statusFilter.value as FilterValue | undefined) ?? 'all')

const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? '')
</script>

<template>
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 18px;">

    <!-- Greeting + avatar -->
    <div class="flex items-center justify-between">
      <div>
        <div style="font-size: 12.5px; color: var(--text-tertiary);">{{ t('home.greetingMobile') }}</div>
        <div style="font-size: 19px; font-weight: 500; color: var(--text-primary); margin-top: 2px;">{{ firstName }}</div>
      </div>
      <div class="flex items-center" style="gap: 10px;">
        <UiNotificationBell />
        <UiAvatar :name="auth.user?.name ?? ''" :src="auth.user?.avatar_url ?? undefined" :size="38" />
      </div>
    </div>

    <!-- Balance hero -->
    <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 18px; padding: 20px; position: relative; overflow: hidden;">
      <span style="position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--red-500);" />
      <div class="flex items-center justify-between">
        <span style="font-size: 12.5px; color: var(--text-tertiary);">{{ t('home.totalSentMobile') }}</span>
      </div>
      <ClientOnly>
        <NumberFlow
          :value="totalLoading ? 0 : (totalMetric?.amount ?? 0)"
          prefix="€ "
          :format="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          locales="pt-BR"
          class="font-mono font-medium tabular-nums"
          :class="{ 'metric-pulse': totalLoading }"
          style="font-size: 36px; letter-spacing: -0.02em; color: var(--text-primary); margin-top: 8px; line-height: 1.1; display: block;"
        />
        <template #fallback>
          <span class="font-mono font-medium tabular-nums" style="font-size: 36px; letter-spacing: -0.02em; color: var(--text-primary); margin-top: 8px; line-height: 1.1; display: block;">€ 0,00</span>
        </template>
      </ClientOnly>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">
        {{ totalMetric?.count ?? 0 }} {{ (totalMetric?.count ?? 0) === 1 ? t('home.request') : t('home.requests') }}
      </div>
    </div>

    <!-- Quick stats 3 cols -->
    <div class="grid grid-cols-3" style="gap: 8px;">
      <div
        v-for="({ label, numericValue, tone, isLoading }) in [
          { label: t('home.pending'),  numericValue: pendingMetric?.count  ?? 0, tone: 'var(--status-pending-fg)',  isLoading: pendingLoading  },
          { label: t('home.approved'), numericValue: approvedMetric?.count ?? 0, tone: 'var(--status-approved-fg)', isLoading: approvedLoading },
          { label: t('home.rejected'), numericValue: rejectedMetric?.count ?? 0, tone: 'var(--status-rejected-fg)', isLoading: rejectedLoading },
        ]"
        :key="label"
        style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 13px; padding: 12px 13px;"
      >
        <ClientOnly>
          <NumberFlow
            :value="isLoading ? 0 : numericValue"
            locales="pt-BR"
            class="font-mono font-medium tabular-nums"
            :class="{ 'metric-pulse': isLoading }"
            style="font-size: 20px; line-height: 1;"
            :style="{ color: tone }"
          />
          <template #fallback>
            <span class="font-mono font-medium tabular-nums" style="font-size: 20px; line-height: 1;" :style="{ color: tone }">0</span>
          </template>
        </ClientOnly>
        <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 6px;">{{ label }}</div>
      </div>
    </div>

    <!-- Filter chips -->
    <div>
      <div style="font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 10px;">{{ t('home.recentRequests') }}</div>
      <div class="flex" style="gap: 7px; overflow-x: auto; margin: 0 -16px; padding: 0 16px 4px;">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          style="flex: none; padding: 6px 13px; border-radius: 999px; cursor: pointer; font-family: var(--font-sans); font-size: 12.5px; font-weight: 500; white-space: nowrap; transition: background 120ms, color 120ms;"
          :style="{
            background: activeFilter === f.value ? 'var(--text-primary)' : 'var(--bg-input)',
            color: activeFilter === f.value ? '#000' : 'var(--text-tertiary)',
            border: `0.5px solid ${activeFilter === f.value ? 'transparent' : 'var(--border-default)'}`,
          }"
          @click="setFilter(f.value === 'all' ? undefined : f.value)"
        >{{ f.label }}</button>
      </div>
    </div>

    <!-- Request list -->
    <div class="flex flex-col" style="gap: 10px;">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <div class="flex items-center" style="gap: 10px;">
            <UiSkeleton width="38px" height="38px" rounded="11px" />
            <div class="flex-1"><UiSkeleton width="70%" /><UiSkeleton width="45%" height="11px" style="margin-top: 5px;" /></div>
          </div>
          <UiSkeleton width="100%" height="0.5px" />
          <div class="flex justify-between"><UiSkeleton width="80px" height="12px" /><UiSkeleton width="90px" height="16px" /></div>
        </div>
      </template>

      <template v-else-if="requests.length === 0">
        <div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px 0;">
          {{ t('home.empty') }}
        </div>
      </template>

      <template v-else>
        <MobileRequestCard
          v-for="req in requests"
          :key="req.id"
          :request="req"
          @click="router.push(`/requests/${req.id}`)"
        />
      </template>

      <UiPagination
        :current-page="meta.current_page"
        :last-page="meta.last_page"
        :loading="loading"
        @change="setPage"
      />
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
