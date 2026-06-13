<!-- app/components/mobile/HistoryMobile.vue -->
<script setup lang="ts">
import { paymentRequestsService, type PaymentRequest } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

type FilterValue = 'all' | 'pending' | 'approved' | 'rejected' | 'expired'

const filters: { value: FilterValue; label: string }[] = [
  { value: 'all',      label: 'Todas' },
  { value: 'pending',  label: 'Pendente' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'expired',  label: 'Expirado' },
]

const all = ref<PaymentRequest[]>([])
const loading = ref(false)
const activeFilter = ref<FilterValue>('all')

const filtered = computed(() =>
  activeFilter.value === 'all' ? all.value : all.value.filter(r => r.status === activeFilter.value)
)

async function fetchRequests() {
  loading.value = true
  try {
    all.value = await paymentRequestsService.list()
  } catch {
    toast.error('Erro ao carregar histórico.')
  } finally {
    loading.value = false
  }
}

onMounted(fetchRequests)
</script>

<template>
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 16px;">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div style="font-size: 11px; color: var(--text-muted);">Suas requisições</div>
        <div style="font-size: 17px; font-weight: 500; color: var(--text-primary); margin-top: 1px;">Histórico</div>
      </div>
    </div>

    <!-- Filter chips -->
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
        @click="activeFilter = f.value"
      >{{ f.label }}</button>
    </div>

    <!-- List -->
    <div class="flex flex-col" style="gap: 10px;">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <div class="flex items-center" style="gap: 10px;">
            <UiSkeleton width="38px" height="38px" rounded="11px" />
            <div class="flex-1"><UiSkeleton width="65%" /><UiSkeleton width="40%" height="11px" style="margin-top: 5px;" /></div>
            <UiSkeleton width="68px" height="20px" rounded="999px" />
          </div>
          <UiSkeleton width="100%" height="0.5px" />
          <div class="flex justify-between"><UiSkeleton width="75px" height="11px" /><UiSkeleton width="85px" height="15px" /></div>
        </div>
      </template>

      <div v-else-if="filtered.length === 0" style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 32px 0;">
        Nenhuma requisição encontrada.
      </div>

      <MobileRequestCard
        v-else
        v-for="req in filtered"
        :key="req.id"
        :request="req"
        @click="router.push(`/requests/${req.id}`)"
      />
    </div>

  </div>
</template>
