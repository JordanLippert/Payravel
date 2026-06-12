import { paymentRequestsService, type PaymentRequest } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'
import { CURRENCIES } from '~/config/constants'

const CURRENCY_FLAG = Object.fromEntries(CURRENCIES.map(c => [c.value, c.flag]))

export function useFinanceController() {
  const toast = useToast()

  const requests = ref<PaymentRequest[]>([])
  const loading = ref(false)
  const resolving = ref<Set<string>>(new Set())
  const fading = ref<Set<string>>(new Set())

  function isCritical(req: PaymentRequest) {
    if (!req.expires_at || req.status !== 'pending') return false
    return new Date(req.expires_at).getTime() - Date.now() < 24 * 60 * 60 * 1000
  }

  function formatExpiry(req: PaymentRequest) {
    if (!req.expires_at) return '—'
    const ms = new Date(req.expires_at).getTime() - Date.now()
    if (ms <= 0) return 'Expirado'
    const h = Math.floor(ms / 3600000)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  const metrics = computed(() => ({
    total: requests.value.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount_eur, 0),
    pending: requests.value.filter(r => r.status === 'pending').length,
    approved: requests.value.filter(r => r.status === 'approved').length,
    rejected: requests.value.filter(r => r.status === 'rejected').length,
    expiringIn24h: requests.value.filter(r => isCritical(r)).length,
  }))

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

  async function resolve(id: string, status: 'approved' | 'rejected') {
    resolving.value = new Set([...resolving.value, id])
    try {
      await paymentRequestsService.updateStatus(id, status)
      fading.value = new Set([...fading.value, id])
      setTimeout(() => {
        requests.value = requests.value.filter(r => r.id !== id)
        fading.value = new Set([...fading.value].filter(fid => fid !== id))
      }, 700)
      toast.success(status === 'approved' ? 'Requisição aprovada.' : 'Requisição rejeitada.')
    } catch {
      toast.error('Erro ao processar requisição.')
    } finally {
      resolving.value = new Set([...resolving.value].filter(rid => rid !== id))
    }
  }

  onMounted(fetchRequests)

  return {
    requests,
    loading,
    resolving,
    fading,
    metrics,
    resolve,
    formatEur,
    formatExpiry,
    isCritical,
    CURRENCY_FLAG,
  }
}
