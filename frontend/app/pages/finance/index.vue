<script setup lang="ts">
import { useFinanceController } from '~/composables/useFinanceController'
import { useAuthStore } from '~/stores/auth'
import { Clock } from '@lucide/vue'

definePageMeta({ middleware: 'auth' })
const isMobile = useIsMobile()

const auth = useAuthStore()
const { requests, loading, resolving, fading, metrics, resolve, formatEur, formatExpiry, isCritical, CURRENCY_FLAG } = useFinanceController()

const nav = computed(() => [
  { label: 'Fila de aprovação', to: '/finance', active: true },
  { label: 'Histórico', to: '/finance/history' },
  { label: 'Relatórios', to: '/finance/reports' },
])
</script>

<template>
  <FinanceMobile v-if="isMobile" />
  <div v-else>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 1180px; margin: 0 auto;">
      <h1 class="font-medium mb-1" style="font-size: 22px; color: var(--text-primary);">Painel financeiro</h1>
      <p class="text-sm mb-6" style="color: var(--text-tertiary);">Revise e libere as requisições da equipe.</p>

      <!-- KPI cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-7" style="gap: 14px;">
        <UiMetricCard
          label="Aguardando revisão"
          :value="metrics.pending"
          sub="na sua fila"
          :accent="true"
          :loading="loading"
        />
        <UiMetricCard
          label="Total em EUR"
          :value="metrics.total"
          prefix="€ "
          :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          sub="valor pendente"
          :loading="loading"
        />
        <UiMetricCard
          label="Aprovados hoje"
          :value="metrics.approved"
          tone="approved"
          sub="processados"
          :loading="loading"
        />
        <UiMetricCard
          label="Expiram em 24h"
          :value="metrics.expiringIn24h"
          tone="pending"
          sub="ação necessária"
          :loading="loading"
        />
      </div>

      <!-- Queue table -->
      <UiCard :padded="false">
        <div
          class="text-sm font-medium"
          style="padding: 16px 20px; border-bottom: 0.5px solid var(--border-subtle); color: var(--text-primary);"
        >Fila de aprovação</div>

        <div v-if="loading" class="py-10 text-center text-sm" style="color: var(--text-muted);">Carregando...</div>

        <div v-else-if="requests.length === 0" class="py-10 text-center text-sm" style="color: var(--text-muted);">
          Fila vazia — tudo revisado. ✓
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full" style="border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                <th
                  v-for="h in ['Funcionário / Descrição', 'Valor local', 'Moeda', 'Em EUR', 'Expira', 'Ação']"
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
                class="transition-opacity duration-700"
                :style="{
                  opacity: fading.has(req.id) ? 0 : 1,
                  borderBottom: i < requests.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
                  background: isCritical(req) ? 'var(--status-pending-bg)' : 'transparent',
                  transition: 'opacity 700ms ease, background 200ms ease',
                }"
              >
                <td style="padding: 14px 16px;">
                  <div style="font-size: 14px; color: var(--text-primary);">{{ req.user?.name ?? '—' }}</div>
                  <div class="mt-0.5" style="font-size: 12px; color: var(--text-muted);">{{ req.description }}</div>
                </td>
                <td style="padding: 14px 16px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-secondary);">
                  {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(req.amount_local) }}
                </td>
                <td style="padding: 14px 16px; font-size: 14px; color: var(--text-secondary);">
                  <span class="inline-flex items-center" style="gap: 6px;">
                    <span v-if="CURRENCY_FLAG[req.currency]" :class="`fi fi-${CURRENCY_FLAG[req.currency]}`" style="width: 18px; height: 14px; border-radius: 2px;" />
                    {{ req.currency }}
                  </span>
                </td>
                <td style="padding: 14px 16px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary);">
                  {{ formatEur(req.amount_eur) }}
                </td>
                <td style="padding: 14px 16px; font-size: 13px; font-family: var(--font-mono);"
                    :style="{ color: isCritical(req) ? 'var(--status-pending-fg)' : 'var(--text-tertiary)' }">
                  <Clock v-if="isCritical(req)" :size="12" class="inline-block mr-1 flex-none" style="vertical-align: -1px;" />{{ formatExpiry(req) }}
                </td>
                <td style="padding: 14px 16px; text-align: right;">
                  <div v-if="req.status === 'pending'" class="inline-flex" style="gap: 6px;">
                    <button
                      @click="resolve(req.id, 'approved')"
                      :disabled="resolving.has(req.id)"
                      title="Aprovar"
                      class="inline-flex items-center justify-center text-[14px] transition-all duration-[120ms] disabled:opacity-40"
                      style="width: 30px; height: 30px; border-radius: 6px; border: 0.5px solid var(--border-default); color: var(--status-approved-fg); background: transparent; cursor: pointer;"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--status-approved-bg)'; ($event.currentTarget as HTMLElement).style.borderColor = 'var(--status-approved-border)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'; ($event.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'"
                    >✓</button>
                    <button
                      @click="resolve(req.id, 'rejected')"
                      :disabled="resolving.has(req.id)"
                      title="Rejeitar"
                      class="inline-flex items-center justify-center text-[14px] transition-all duration-[120ms] disabled:opacity-40"
                      style="width: 30px; height: 30px; border-radius: 6px; border: 0.5px solid var(--border-default); color: var(--status-rejected-fg); background: transparent; cursor: pointer;"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--status-rejected-bg)'; ($event.currentTarget as HTMLElement).style.borderColor = 'var(--status-rejected-border)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'; ($event.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'"
                    >✕</button>
                  </div>
                  <UiBadge v-else :status="req.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </main>
  </div>
</template>
