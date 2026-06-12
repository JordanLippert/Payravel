import { useAuthStore } from '~/stores/auth'
import { paymentRequestsService, type PaymentRequest } from '~/services/paymentRequestsService'
import { metricsService, type MetricResult } from '~/services/metricsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'

export function useDashboardController() {
  const auth = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const requests = ref<PaymentRequest[]>([])
  const loading = ref(false)

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
      requests.value = await paymentRequestsService.list()
    } catch {
      toast.error('Erro ao carregar requisições.')
    } finally {
      loading.value = false
    }
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
    totalMetric,    totalLoading,
    pendingMetric,  pendingLoading,
    approvedMetric, approvedLoading,
    rejectedMetric, rejectedLoading,
    formatEur,
    formatDate,
    goToDetail,
  }
}
