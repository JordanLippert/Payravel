<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { paymentRequestsService, type PaymentRequest, type PaginationMeta } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'
import { CURRENCIES } from '~/config/constants'

definePageMeta({ middleware: 'auth' })
const isMobile = useIsMobile()

const auth = useAuthStore()
const toast = useToast()
const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

const nav = computed(() => [
  { label: 'Fila de aprovação', to: '/finance' },
  { label: 'Histórico', to: '/finance/history', active: true },
  { label: 'Relatórios', to: '/finance/reports' },
])

type FilterValue = 'all' | 'approved' | 'rejected' | 'expired'

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all',      label: 'Todas' },
  { value: 'approved', label: 'Aprovadas' },
  { value: 'rejected', label: 'Rejeitadas' },
  { value: 'expired',  label: 'Expiradas' },
]

const slideDirection = ref<'left' | 'right'>('left')
const requests = ref<PaymentRequest[]>([])
const loading = ref(false)
const statusFilter = ref<FilterValue>('all')
const page = ref(1)
const meta = ref<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

function statusParam(filter: FilterValue): string {
  return filter === 'all' ? 'resolved' : filter
}

async function fetch() {
  loading.value = true
  try {
    const result = await paymentRequestsService.list({
      page: page.value,
      status: statusParam(statusFilter.value),
    })
    requests.value = result.data
    meta.value = result.meta
  } catch {
    toast.error('Erro ao carregar histórico.')
  } finally {
    loading.value = false
  }
}

function setFilter(val: FilterValue) {
  if (val === statusFilter.value) return
  const oldIdx = FILTERS.findIndex(f => f.value === statusFilter.value)
  const newIdx = FILTERS.findIndex(f => f.value === val)
  slideDirection.value = newIdx > oldIdx ? 'left' : 'right'
  statusFilter.value = val
  page.value = 1
  fetch()
}

function setPage(p: number) {
  page.value = p
  fetch()
}

function formatDate(date?: string) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(date))
    .replace('.', '')
}

onMounted(fetch)
</script>

<template>
  <FinanceHistoryMobile v-if="isMobile" />
  <div v-else>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 1180px; margin: 0 auto;">
      <div class="flex items-end justify-between mb-6">
        <div>
          <h1 class="font-medium mb-1" style="font-size: 22px; color: var(--text-primary);">Histórico</h1>
          <p class="text-sm" style="color: var(--text-tertiary);">Requisições já revisadas ou expiradas.</p>
        </div>

        <!-- Filter pill group -->
        <div
          class="inline-flex relative"
          style="border: 0.5px solid var(--border-subtle); border-radius: 9px; padding: 3px; background: var(--bg-elevated); gap: 2px;"
        >
          <button
            v-for="opt in FILTERS"
            :key="opt.value"
            @click="setFilter(opt.value)"
            class="relative text-sm transition-colors duration-150"
            style="padding: 5px 14px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;"
            :style="{
              background: statusFilter === opt.value ? 'var(--bg-surface)' : 'transparent',
              color: statusFilter === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: statusFilter === opt.value ? '500' : '400',
              boxShadow: statusFilter === opt.value ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
            }"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <UiCard :padded="false">
        <div v-if="loading" class="overflow-x-auto">
          <table class="w-full" style="border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                <th v-for="h in ['Funcionário / Descrição', 'Valor local', 'Moeda', 'Em EUR', 'Status', 'Revisado em']" :key="h"
                  class="text-left font-medium"
                  style="padding: 10px 16px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);"
                >{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(w, i) in ['55%','65%','50%','60%','52%']" :key="i"
                :style="{ borderBottom: i < 4 ? '0.5px solid var(--border-subtle)' : 'none' }"
              >
                <td style="padding: 14px 16px;">
                  <UiSkeleton :width="w" />
                  <UiSkeleton width="45%" height="11px" style="margin-top: 6px;" />
                </td>
                <td style="padding: 14px 16px;"><div class="flex justify-end"><UiSkeleton width="72px" /></div></td>
                <td style="padding: 14px 16px;"><UiSkeleton width="48px" /></td>
                <td style="padding: 14px 16px;"><div class="flex justify-end"><UiSkeleton width="80px" /></div></td>
                <td style="padding: 14px 16px;"><UiSkeleton width="65px" height="22px" rounded="999px" /></td>
                <td style="padding: 14px 16px;"><UiSkeleton width="90px" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <Transition :name="slideDirection === 'left' ? 'slide-left' : 'slide-right'" mode="out-in">
          <div v-if="!loading" :key="statusFilter">
            <div v-if="requests.length === 0" class="py-10 text-center text-sm" style="color: var(--text-muted);">
              Nenhuma requisição encontrada.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 0.5px solid var(--border-subtle);">
                    <th
                      v-for="h in ['Funcionário / Descrição', 'Valor local', 'Moeda', 'Em EUR', 'Status', 'Revisado em']"
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
                    @click="navigateTo(`/requests/${req.id}`)"
                    :style="{
                      borderBottom: i < requests.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
                      cursor: 'pointer',
                    }"
                    @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'"
                    @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
                  >
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; color: var(--text-primary); font-weight: 500;">{{ req.user?.name ?? '—' }}</div>
                      <div class="mt-0.5" style="font-size: 12px; color: var(--text-muted);">{{ req.description }}</div>
                    </td>
                    <td style="padding: 14px 16px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-secondary);">
                      {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(req.amount_local) }}
                    </td>
                    <td style="padding: 14px 16px; font-size: 14px; color: var(--text-secondary);">
                      <span class="inline-flex items-center" style="gap: 6px;">
                        <span style="font-size: 15px;">{{ CURRENCY_FLAG[req.currency] ?? '' }}</span>
                        {{ req.currency }}
                      </span>
                    </td>
                    <td style="padding: 14px 16px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 14px; color: var(--text-primary); font-weight: 500;">
                      {{ formatEur(req.amount_eur) }}
                    </td>
                    <td style="padding: 14px 16px;">
                      <UiBadge :status="req.status" />
                    </td>
                    <td style="padding: 14px 16px; font-size: 13px; color: var(--text-tertiary); white-space: nowrap;">
                      {{ formatDate(req.reviewed_at ?? req.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
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

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

/* slide left: entra da direita, sai pela esquerda */
.slide-left-enter-from  { opacity: 0; transform: translateX(24px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-24px); }

/* slide right: entra da esquerda, sai pela direita */
.slide-right-enter-from { opacity: 0; transform: translateX(-24px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(24px); }
</style>
