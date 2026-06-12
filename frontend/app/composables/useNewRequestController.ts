import { z } from 'zod'
import { useToast } from 'vue-toastification'
import { paymentRequestsService } from '~/services/paymentRequestsService'
import { exchangeRatesService } from '~/services/exchangeRatesService'
import { useAuthStore } from '~/stores/auth'
import { CURRENCIES } from '~/config/constants'

const schema = z.object({
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  currency: z.string().min(1, 'Selecione uma moeda'),
})

export function useNewRequestController() {
  const router = useRouter()
  const toast = useToast()

  const step = ref<1 | 2 | 3>(1)
  const loading = ref(false)
  const rateLoading = ref(false)
  const advancing = ref(false)
  const fetchFailed = ref(false)

  const description = ref('')
  const rawCents = ref(0)
  const currency = ref('')
  const rate = ref<number | null>(null)
  const rateSource = ref<string | null>(null)
  const fetchedAt = ref<string | null>(null)
  const expiresAt = ref<string | null>(null)
  const errors = ref<Record<string, string>>({})

  const now = ref(Date.now())
  let ticker: ReturnType<typeof setInterval> | null = null

  const amount = computed(() => rawCents.value / 100)

  const amountDisplay = computed(() =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount.value)
  )

  const PASSTHROUGH_KEYS = new Set(['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'])

  function onAmountKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || PASSTHROUGH_KEYS.has(e.key)) return
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      if (rawCents.value === 0 && e.key === '0') return
      rawCents.value = rawCents.value * 10 + Number(e.key)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      rawCents.value = Math.floor(rawCents.value / 10)
    } else {
      e.preventDefault()
    }
  }

  const amountEur = computed(() => rate.value ? amount.value / rate.value : null)

  const rateValidFor = computed(() => {
    if (!expiresAt.value) return null
    const ms = new Date(expiresAt.value).getTime() - now.value
    if (ms <= 0) return 0
    return Math.ceil(ms / 60000)
  })

  async function fetchRate() {
    if (!currency.value) return
    rateLoading.value = true
    rate.value = null
    rateSource.value = null
    fetchedAt.value = null
    expiresAt.value = null
    try {
      const data = await exchangeRatesService.show(currency.value)
      rate.value = data.rate
      rateSource.value = data.source ?? null
      fetchedAt.value = data.fetched_at
      expiresAt.value = data.expires_at
      if (ticker) clearInterval(ticker)
      ticker = setInterval(() => { now.value = Date.now() }, 30000)
    } catch {
      // silent — error shown only if user advances to step 2 and rate is still null
    } finally {
      rateLoading.value = false
    }
  }

  // Pre-fetch silencioso quando moeda é selecionada
  watch(currency, (val) => {
    fetchFailed.value = false
    if (val) fetchRate()
  })

  onMounted(() => {
    const auth = useAuthStore()
    const userCurrency = auth.user?.currency
    if (userCurrency && CURRENCIES.some(c => c.value === userCurrency)) {
      currency.value = userCurrency
    }
  })

  onUnmounted(() => { if (ticker) clearInterval(ticker) })

  async function advance() {
    errors.value = {}
    fetchFailed.value = false
    const result = schema.safeParse({
      description: description.value,
      amount: amount.value,
      currency: currency.value,
    })
    if (!result.success) {
      result.error.issues.forEach((e) => { errors.value[String(e.path[0])] = e.message })
      return
    }

    advancing.value = true
    try {
      if (rate.value) { step.value = 2; return }

      if (rateLoading.value) {
        await new Promise<void>((resolve) => {
          const stop = watch(rateLoading, (loading) => {
            if (!loading) { stop(); resolve() }
          })
        })
      }

      if (!rate.value) {
        await fetchRate()
        if (!rate.value) { fetchFailed.value = true; return }
      }

      step.value = 2
    } finally {
      advancing.value = false
    }
  }

  function confirm() {
    step.value = 3
  }

  async function retryFetch() {
    fetchFailed.value = false
    await fetchRate()
    if (!rate.value) fetchFailed.value = true
  }

  async function submit() {
    loading.value = true
    try {
      await paymentRequestsService.create({
        description: description.value,
        amount: amount.value,
        currency: currency.value,
      })
      toast.success('Requisição enviada com sucesso!')
      await router.push('/')
    } catch {
      toast.error('Erro ao enviar requisição.')
    } finally {
      loading.value = false
    }
  }

  return {
    step,
    loading,
    rateLoading,
    advancing,
    fetchFailed,
    description,
    rateSource,
    amountDisplay,
    onAmountKey,
    currency,
    rate,
    rateValidFor,
    amountEur,
    errors,
    CURRENCIES,
    advance,
    confirm,
    retryFetch,
    submit,
  }
}
