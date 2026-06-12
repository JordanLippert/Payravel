import { paymentRequestsService, type PaymentRequest } from '~/services/paymentRequestsService'
import { useToast } from 'vue-toastification'
import { formatEur } from '~/utils/formatCurrency'

export function useRequestDetailController() {
  const route = useRoute()
  const toast = useToast()

  const request = ref<PaymentRequest | null>(null)
  const loading = ref(false)

  const id = computed(() => String(route.params.id))

  const timeline = computed(() => {
    if (!request.value) return []
    const status = request.value.status
    const base = [
      { label: 'Requisição enviada', done: true,                              current: false,               rejected: false,              expired: false },
      { label: 'Em análise',         done: status !== 'pending',              current: status === 'pending', rejected: false,             expired: false },
      {
        label:    status === 'rejected' ? 'Rejeitada' : status === 'expired' ? 'Expirada' : 'Aprovada',
        done:     status === 'approved' || status === 'rejected' || status === 'expired',
        current:  false,
        rejected: status === 'rejected',
        expired:  status === 'expired',
      },
    ]
    if (status !== 'rejected' && status !== 'expired') {
      base.push({ label: 'Pagamento processado', done: status === 'approved', current: false, rejected: false, expired: false })
    }
    return base
  })

  async function fetchRequest() {
    loading.value = true
    try {
      request.value = await paymentRequestsService.show(id.value)
    } catch {
      toast.error('Erro ao carregar requisição.')
    } finally {
      loading.value = false
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date))
  }

  onMounted(fetchRequest)

  return { request, loading, timeline, formatEur, formatDate }
}
