<!-- app/components/mobile/FinanceMobile.vue -->
<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { Clock, Check, X, Shield } from '@lucide/vue'
import { useFinanceController } from '~/composables/useFinanceController'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const { requests, loading, page, meta, setPage, resolving, fading, metrics, resolve, formatEur, formatExpiry, isCritical, CURRENCY_FLAG } = useFinanceController()
</script>

<template>
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 18px;">

    <!-- Header with role pill -->
    <div class="flex items-center justify-between">
      <div>
        <div style="font-size: 11px; color: var(--text-muted);">Painel</div>
        <div style="font-size: 17px; font-weight: 500; color: var(--text-primary); margin-top: 1px;">Aprovações</div>
      </div>
      <div class="flex items-center gap-2">
        <UiNotificationBell />
        <span style="display: inline-flex; align-items: center; gap: 6px; background: var(--red-500); border-radius: 999px; padding: 4px 11px 4px 4px;">
          <span style="width: 24px; height: 24px; border-radius: 999px; background: rgba(0,0,0,.22); display: flex; align-items: center; justify-content: center;">
            <Shield :size="13" style="color: #fff;" />
          </span>
          <span style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 12px; font-weight: 500; color: #fff;">{{ auth.user?.name?.split(' ')[0] }}</span>
            <span style="font-size: 10px; color: rgba(255,255,255,.8);">Finance</span>
          </span>
        </span>
      </div>
    </div>

    <!-- Metrics 2x2 -->
    <div class="grid grid-cols-2" style="gap: 9px;">
      <div
        v-for="({ label, numericValue, prefix, formatOptions, tone }) in [
          { label: 'Aguardando revisão', numericValue: metrics.pending,       prefix: undefined, formatOptions: undefined,                      tone: 'var(--status-pending-fg)' },
          { label: 'Total em EUR',       numericValue: metrics.total,         prefix: '€ ', formatOptions: { minimumFractionDigits: 0 },  tone: 'var(--text-primary)' },
          { label: 'Aprovados hoje',     numericValue: metrics.approved,      prefix: undefined, formatOptions: undefined,                      tone: 'var(--status-approved-fg)' },
          { label: 'Expiram em 24h',     numericValue: metrics.expiringIn24h, prefix: undefined, formatOptions: undefined,                      tone: 'var(--status-rejected-fg)' },
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
            style="font-size: 20px; line-height: 1;"
            :style="{ color: tone }"
          />
          <template #fallback>
            <span class="font-mono font-medium tabular-nums" style="font-size: 20px; line-height: 1;" :style="{ color: tone }">
              {{ prefix ?? '' }}0
            </span>
          </template>
        </ClientOnly>
        <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px;">{{ label }}</div>
      </div>
    </div>

    <div style="font-size: 14px; font-weight: 500; color: var(--text-primary);">Fila de revisão</div>

    <!-- Queue list -->
    <div class="flex flex-col" style="gap: 10px;">

      <template v-if="loading">
        <div v-for="i in 3" :key="i" style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
          <div class="flex items-center" style="gap: 10px;">
            <UiSkeleton width="38px" height="38px" rounded="11px" />
            <div class="flex-1"><UiSkeleton width="60%" /><UiSkeleton width="40%" height="11px" style="margin-top: 5px;" /></div>
            <UiSkeleton width="52px" height="20px" rounded="999px" />
          </div>
          <div class="flex justify-between items-end">
            <UiSkeleton width="90px" height="20px" rounded="4px" />
            <div class="flex" style="gap: 7px;"><UiSkeleton width="40px" height="40px" rounded="11px" /><UiSkeleton width="40px" height="40px" rounded="11px" /></div>
          </div>
        </div>
      </template>

      <div v-else-if="requests.length === 0" style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 32px 0;">
        Fila vazia — tudo revisado. ✓
      </div>

      <div
        v-else
        v-for="req in requests"
        :key="req.id"
        style="border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 13px; transition: opacity 700ms ease;"
        :style="{
          background: 'var(--surface-card, var(--bg-elevated))',
          border: `0.5px solid ${isCritical(req) && !fading.has(req.id) ? 'var(--status-pending-fg)' : 'var(--border-subtle)'}`,
          opacity: fading.has(req.id) ? 0 : 1,
        }"
      >
        <!-- Card top: flag + desc + expiry -->
        <div class="flex items-center" style="gap: 10px;">
          <span style="width: 38px; height: 38px; border-radius: 11px; flex: none; background: var(--bg-input); border: 0.5px solid var(--border-default); display: flex; align-items: center; justify-content: center; font-size: 19px;">
            {{ CURRENCY_FLAG[req.currency] ?? '' }}
          </span>
          <div class="flex-1 min-w-0">
            <div style="font-size: 13.5px; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ req.description }}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">{{ req.user?.name ?? '—' }}</div>
          </div>
          <span
            style="display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 500; border-radius: 999px; padding: 3px 8px; flex: none;"
            :style="{
              color: isCritical(req) ? 'var(--status-pending-fg)' : 'var(--text-muted)',
              background: isCritical(req) ? 'var(--status-pending-bg)' : 'var(--bg-input)',
              border: `0.5px solid ${isCritical(req) ? 'var(--status-pending-border)' : 'var(--border-default)'}`,
            }"
          >
            <Clock :size="11" :style="{ color: isCritical(req) ? 'var(--status-pending-fg)' : 'var(--text-muted)' }" />
            {{ formatExpiry(req) }}
          </span>
        </div>

        <!-- Amount + actions -->
        <div class="flex items-end justify-between">
          <div>
            <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: baseline; gap: 3px;">
              <span>{{ req.currency }}</span>
              <ClientOnly>
                <NumberFlow
                  :value="req.amount_local"
                  :format="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                  locales="pt-BR"
                  style="font-size: 11px; color: var(--text-muted);"
                />
                <template #fallback><span>0,00</span></template>
              </ClientOnly>
            </div>
            <ClientOnly>
              <NumberFlow
                :value="req.amount_eur"
                prefix="€ "
                :format="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                locales="pt-BR"
                class="font-mono font-medium tabular-nums"
                style="font-size: 18px; color: var(--text-primary); margin-top: 2px;"
              />
              <template #fallback>
                <span class="font-mono font-medium tabular-nums" style="font-size: 18px; color: var(--text-primary); margin-top: 2px;">€ 0,00</span>
              </template>
            </ClientOnly>
          </div>

          <div v-if="req.status === 'pending'" class="flex" style="gap: 8px;">
            <button
              type="button"
              :disabled="resolving.has(req.id)"
              style="width: 42px; height: 42px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 120ms, border-color 120ms;"
              :style="{ background: 'var(--status-rejected-bg)', border: '0.5px solid var(--status-rejected-border)', opacity: resolving.has(req.id) ? 0.4 : 1 }"
              @click="resolve(req.id, 'rejected')"
            >
              <X :size="17" style="color: var(--status-rejected-fg);" :stroke-width="2.2" />
            </button>
            <button
              type="button"
              :disabled="resolving.has(req.id)"
              style="width: 42px; height: 42px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 120ms, border-color 120ms;"
              :style="{ background: 'var(--status-approved-bg)', border: '0.5px solid var(--status-approved-border)', opacity: resolving.has(req.id) ? 0.4 : 1 }"
              @click="resolve(req.id, 'approved')"
            >
              <Check :size="17" style="color: var(--status-approved-fg);" :stroke-width="2.4" />
            </button>
          </div>
          <UiBadge v-else :status="req.status" style="border-radius: 999px;" />
        </div>

      </div>

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
