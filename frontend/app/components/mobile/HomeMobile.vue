<!-- app/components/mobile/HomeMobile.vue -->
<script setup lang="ts">
import { Bell } from '@lucide/vue'
import { useDashboardController } from '~/composables/useDashboardController'
import { CURRENCIES } from '~/config/constants'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const {
  requests, loading,
  totalMetric, totalLoading,
  pendingMetric, approvedMetric, rejectedMetric,
  formatEur, formatDate,
} = useDashboardController()

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

type FilterValue = 'all' | 'pending' | 'approved' | 'rejected'
const filter = ref<FilterValue>('all')

const filters: { value: FilterValue; label: string }[] = [
  { value: 'all',      label: 'Todas' },
  { value: 'pending',  label: 'Pendente' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
]

const filtered = computed(() =>
  filter.value === 'all' ? requests.value : requests.value.filter(r => r.status === filter.value)
)

const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? '')
</script>

<template>
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 18px;">

    <!-- Greeting + avatar -->
    <div class="flex items-center justify-between">
      <div>
        <div style="font-size: 12.5px; color: var(--text-tertiary);">Bem-vindo de volta,</div>
        <div style="font-size: 19px; font-weight: 500; color: var(--text-primary); margin-top: 2px;">{{ firstName }}</div>
      </div>
      <div class="flex items-center" style="gap: 10px;">
        <button
          type="button"
          style="background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 11px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;"
        >
          <Bell :size="18" style="color: var(--text-secondary);" :stroke-width="1.8" />
        </button>
        <UiAvatar :name="auth.user?.name ?? ''" :src="auth.user?.avatar_url ?? undefined" :size="38" />
      </div>
    </div>

    <!-- Balance hero -->
    <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 18px; padding: 20px; position: relative; overflow: hidden;">
      <span style="position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--red-500);" />
      <div class="flex items-center justify-between">
        <span style="font-size: 12.5px; color: var(--text-tertiary);">Total enviado este mês</span>
      </div>
      <div v-if="totalLoading" style="margin-top: 8px;">
        <UiSkeleton width="140px" height="40px" rounded="6px" />
      </div>
      <div v-else style="font-family: var(--font-mono); font-size: 36px; font-weight: 500; letter-spacing: -0.02em; color: var(--text-primary); font-variant-numeric: tabular-nums; margin-top: 8px; line-height: 1.1;">
        {{ formatEur(totalMetric?.amount ?? 0) }}
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">
        {{ totalMetric?.count ?? 0 }} {{ (totalMetric?.count ?? 0) === 1 ? 'requisição' : 'requisições' }}
      </div>
    </div>

    <!-- Quick stats 3 cols -->
    <div class="grid grid-cols-3" style="gap: 8px;">
      <div
        v-for="({ label, value, tone }) in [
          { label: 'Pendente',  value: pendingMetric?.count  ?? 0, tone: 'var(--status-pending-fg)'  },
          { label: 'Aprovado',  value: approvedMetric?.count ?? 0, tone: 'var(--status-approved-fg)' },
          { label: 'Rejeitado', value: rejectedMetric?.count ?? 0, tone: 'var(--status-rejected-fg)' },
        ]"
        :key="label"
        style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 13px; padding: 12px 13px;"
      >
        <div style="font-family: var(--font-mono); font-size: 20px; font-weight: 500; line-height: 1;" :style="{ color: tone }">{{ value }}</div>
        <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 6px;">{{ label }}</div>
      </div>
    </div>

    <!-- Filter chips -->
    <div>
      <div style="font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 10px;">Requisições recentes</div>
      <div class="flex" style="gap: 7px; overflow-x: auto; margin: 0 -16px; padding: 0 16px 4px;">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          style="flex: none; padding: 6px 13px; border-radius: 999px; cursor: pointer; font-family: var(--font-sans); font-size: 12.5px; font-weight: 500; white-space: nowrap; transition: background 120ms, color 120ms;"
          :style="{
            background: filter === f.value ? 'var(--text-primary)' : 'var(--bg-input)',
            color: filter === f.value ? '#000' : 'var(--text-tertiary)',
            border: `0.5px solid ${filter === f.value ? 'transparent' : 'var(--border-default)'}`,
          }"
          @click="filter = f.value"
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

      <template v-else-if="filtered.length === 0">
        <div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px 0;">
          Nenhuma requisição neste filtro.
        </div>
      </template>

      <template v-else>
        <MobileRequestCard
          v-for="req in filtered"
          :key="req.id"
          :request="req"
          @click="router.push(`/requests/${req.id}`)"
        />
      </template>
    </div>

  </div>
</template>
