<!-- app/components/mobile/FinanceHistoryMobile.vue -->
<script setup lang="ts">
import { Shield } from '@lucide/vue'
import { paymentRequestsService, type PaymentRequest, type PaginationMeta } from '~/services/paymentRequestsService'
import { useAuthStore } from '~/stores/auth'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

type FilterValue = 'all' | 'approved' | 'rejected' | 'expired'

const filters: { value: FilterValue; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'expired',  label: 'Expirado' },
]

const requests = ref<PaymentRequest[]>([])
const loading = ref(false)
const activeFilter = ref<FilterValue>('all')
const page = ref(1)
const meta = ref<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

function statusParam(filter: FilterValue): string {
  return filter === 'all' ? 'resolved' : filter
}

async function fetchRequests() {
  loading.value = true
  try {
    const result = await paymentRequestsService.list({
      page: page.value,
      status: statusParam(activeFilter.value),
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
  activeFilter.value = val
  page.value = 1
  fetchRequests()
}

function setPage(p: number) {
  page.value = p
  fetchRequests()
}

onMounted(fetchRequests)
</script>

<template>
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 16px;">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div style="font-size: 11px; color: var(--text-muted);">Financeiro</div>
        <div style="font-size: 17px; font-weight: 500; color: var(--text-primary); margin-top: 1px;">Histórico</div>
      </div>
      <span style="display: inline-flex; align-items: center; gap: 6px; background: var(--red-500); border-radius: 999px; padding: 4px 11px 4px 4px;">
        <span style="width: 22px; height: 22px; border-radius: 999px; background: rgba(0,0,0,.22); display: flex; align-items: center; justify-content: center;">
          <Shield :size="12" style="color: #fff;" />
        </span>
        <span style="font-size: 11px; font-weight: 500; color: #fff;">Finance</span>
      </span>
    </div>

    <!-- Filters -->
    <div class="flex" style="gap: 7px; overflow-x: auto; margin: 0 -16px; padding: 0 16px 2px;">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        style="flex: none; padding: 5px 12px; border-radius: 999px; cursor: pointer; font-family: var(--font-sans); font-size: 12px; font-weight: 500; white-space: nowrap; transition: background 120ms, color 120ms;"
        :style="{
          background: activeFilter === f.value ? 'var(--text-primary)' : 'var(--bg-input)',
          color: activeFilter === f.value ? '#000' : 'var(--text-tertiary)',
          border: `0.5px solid ${activeFilter === f.value ? 'transparent' : 'var(--border-default)'}`,
        }"
        @click="setFilter(f.value)"
      >{{ f.label }}</button>
    </div>

    <!-- List (showEmployee=true) -->
    <div class="flex flex-col" style="gap: 10px;">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <div class="flex items-center" style="gap: 10px;">
            <UiSkeleton width="38px" height="38px" rounded="11px" />
            <div class="flex-1"><UiSkeleton width="65%" /><UiSkeleton width="42%" height="11px" style="margin-top: 5px;" /></div>
            <UiSkeleton width="68px" height="20px" rounded="999px" />
          </div>
          <UiSkeleton width="100%" height="0.5px" />
          <div class="flex justify-between"><UiSkeleton width="75px" height="11px" /><UiSkeleton width="85px" height="15px" /></div>
        </div>
      </template>
      <div v-else-if="requests.length === 0" style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 32px 0;">
        Nenhuma requisição encontrada.
      </div>
      <MobileRequestCard
        v-else
        v-for="req in requests"
        :key="req.id"
        :request="req"
        :show-employee="true"
        @click="router.push(`/requests/${req.id}`)"
      />
      <UiPagination
        :current-page="meta.current_page"
        :last-page="meta.last_page"
        :loading="loading"
        @change="setPage"
      />
    </div>

  </div>
</template>
