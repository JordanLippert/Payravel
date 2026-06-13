import { useAuthStore } from '~/stores/auth'
import { paymentRequestsService, type PaymentRequest, type PaginationMeta } from '~/services/paymentRequestsService'
import { metricsService, type MetricResult } from '~/services/metricsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'

export function useDashboardController() {
  const auth = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const requests = ref<PaymentRequest[]>([])
  const loading = ref(false)
  const page = ref(1)
  const statusFilter = ref<string | undefined>(undefined)
  const meta = ref<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

  const totalMetric    = ref<MetricResult | null>(null)
  const pendingMetric  = ref<MetricResult | null>(null)
  const approvedMetric = ref<MetricResult | null>(null)
  const rejectedMetric = ref<MetricResult | null>(null)

  const totalLoading    = ref(true)
  const pendingLoading  = ref(true)
  const approvedLoading = ref(true)
  const rejectedLoading = ref(true)

  async function fetchRequests() {
    loading.value = true
    try {
      const result = await paymentRequestsService.list({ page: page.value, status: statusFilter.value })
      requests.value = result.data
      meta.value = result.meta
    } catch {
      toast.error('Erro ao carregar requisições.')
    } finally {
      loading.value = false
    }
  }

  function setPage(p: number) {
    page.value = p
    fetchRequests()
  }

  function setFilter(s: string | undefined) {
    statusFilter.value = s
    page.value = 1
    fetchRequests()
  }

  async function fetchTotal() {
    totalLoading.value = true
    try { totalMetric.value = await metricsService.total() }
    catch { /* silencioso */ }
    finally { totalLoading.value = false }
  }

  async function fetchPending() {
    pendingLoading.value = true
    try { pendingMetric.value = await metricsService.pending() }
    catch { /* silencioso */ }
    finally { pendingLoading.value = false }
  }

  async function fetchApproved() {
    approvedLoading.value = true
    try { approvedMetric.value = await metricsService.approved() }
    catch { /* silencioso */ }
    finally { approvedLoading.value = false }
  }

  async function fetchRejected() {
    rejectedLoading.value = true
    try { rejectedMetric.value = await metricsService.rejected() }
    catch { /* silencioso */ }
    finally { rejectedLoading.value = false }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      .format(new Date(date))
      .replace('.', '')
  }

  function goToDetail(id: string) {
    router.push(`/requests/${id}`)
  }

  onMounted(() => {
    fetchRequests()
    fetchTotal()
    fetchPending()
    fetchApproved()
    fetchRejected()
  })

  return {
    auth,
    requests,
    loading,
    page,
    meta,
    setPage,
    statusFilter,
    setFilter,
    totalMetric,    totalLoading,
    pendingMetric,  pendingLoading,
    approvedMetric, approvedLoading,
    rejectedMetric, rejectedLoading,
    formatEur,
    formatDate,
    goToDetail,
  }
}
