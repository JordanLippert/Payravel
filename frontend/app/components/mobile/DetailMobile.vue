<!-- app/components/mobile/DetailMobile.vue -->
<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'
import { useRequestDetailController } from '~/composables/useRequestDetailController'
import { CURRENCIES } from '~/config/constants'

const router = useRouter()
const { request, loading, timeline, formatEur, formatDate } = useRequestDetailController()

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const flag = computed(() => request.value ? (CURRENCY_FLAG[request.value.currency] ?? '') : '')

const timelineItems = computed(() => timeline.value.map(t => ({
  ...t,
  dotColor: t.rejected
    ? 'var(--status-rejected-fg)'
    : t.expired
    ? 'var(--text-muted)'
    : t.done || t.current
    ? 'var(--status-approved-fg)'
    : 'transparent',
  borderColor: t.rejected
    ? 'var(--status-rejected-fg)'
    : t.expired
    ? 'var(--text-muted)'
    : t.current
    ? 'var(--status-pending-fg)'
    : t.done
    ? 'var(--status-approved-fg)'
    : 'var(--border-default)',
})))
</script>

<template>
  <div style="min-height: 100dvh;">

    <!-- Back bar -->
    <div style="display: flex; align-items: center; gap: 9px; padding: 6px 14px 0; height: 48px;">
      <button
        type="button"
        style="background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex: none;"
        @click="router.back()"
      >
        <ChevronLeft :size="18" style="color: var(--text-primary);" />
      </button>
      <span v-if="request" style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">
        PR-{{ request.id.slice(0, 6).toUpperCase() }}
      </span>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" style="padding: 14px 16px 24px; display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <UiSkeleton width="52px" height="52px" rounded="16px" />
        <UiSkeleton width="120px" height="13px" />
        <UiSkeleton width="180px" height="44px" rounded="6px" />
        <UiSkeleton width="70px" height="22px" rounded="999px" />
      </div>
      <UiSkeleton width="100%" height="180px" rounded="14px" />
    </div>

    <div v-else-if="request" style="padding: 14px 16px 32px; display: flex; flex-direction: column; gap: 20px;">

      <!-- Amount hero -->
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <span style="width: 52px; height: 52px; border-radius: 17px; background: var(--bg-input); border: 0.5px solid var(--border-default); display: flex; align-items: center; justify-content: center; font-size: 27px;">
          {{ flag }}
        </span>
        <div>
          <div style="font-size: 13px; color: var(--text-muted);">{{ request.description }}</div>
          <div style="font-family: var(--font-mono); font-size: 40px; font-weight: 500; letter-spacing: -0.02em; color: var(--text-primary); margin-top: 5px; line-height: 1.05; font-variant-numeric: tabular-nums;">
            {{ formatEur(request.amount_eur) }}
          </div>
          <div style="font-family: var(--font-mono); font-size: 12.5px; color: var(--text-muted); margin-top: 3px;">
            {{ request.currency }} {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(request.amount_local) }}
          </div>
        </div>
        <UiBadge :status="request.status" style="border-radius: 999px;" />
      </div>

      <!-- Info rows -->
      <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 15px; overflow: hidden;">
        <div
          v-for="([k, v, mono], i) in [
            ['Moeda original', `${flag} ${request.currency}`, false],
            ['Valor local', `${request.currency} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(request.amount_local)}`, true],
            ['Equivalente em EUR', formatEur(request.amount_eur), true],
            ['Taxa aplicada', request.exchange_rate ? String(request.exchange_rate) : '—', true],
            ['Fonte da taxa', request.exchange_rate_source ?? '—', false],
            ['Solicitante', request.user?.name ?? '—', false],
          ]"
          :key="k"
          style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 15px;"
          :style="{ borderBottom: i < 5 ? '0.5px solid var(--border-subtle)' : 'none' }"
        >
          <span style="font-size: 13px; color: var(--text-tertiary);">{{ k }}</span>
          <span
            style="font-size: 13px; color: var(--text-primary); font-weight: 500; text-align: right;"
            :style="{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontVariantNumeric: mono ? 'tabular-nums' : 'normal' }"
          >{{ v }}</span>
        </div>
      </div>

      <!-- Timeline -->
      <div>
        <div style="font-size: 13.5px; font-weight: 500; color: var(--text-primary); margin-bottom: 13px;">Histórico</div>
        <div class="flex flex-col">
          <div v-for="(item, i) in timelineItems" :key="i" class="flex" style="gap: 12px;">
            <div class="flex flex-col items-center">
              <span
                style="width: 18px; height: 18px; border-radius: 999px; flex: none; display: flex; align-items: center; justify-content: center;"
                :style="{
                  background: item.dotColor,
                  border: `1.5px solid ${item.borderColor}`,
                }"
              />
              <span v-if="i < timelineItems.length - 1" style="width: 1.5px; flex: 1; min-height: 24px; background: var(--border-default);" />
            </div>
            <div :style="{ paddingBottom: i < timelineItems.length - 1 ? '16px' : '0', marginTop: '1px' }">
              <div
                style="font-size: 13.5px;"
                :style="{ color: item.done || item.current ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: item.done || item.current ? '500' : '400' }"
              >{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
