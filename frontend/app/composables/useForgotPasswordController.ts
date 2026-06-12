import { z } from 'zod'
import { useToast } from 'vue-toastification'
import { authService } from '~/services/authService'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

export function useForgotPasswordController() {
  const toast = useToast()

  const loading = ref(false)
  const sent = ref(false)
  const email = ref('')
  const errors = ref<Record<string, string>>({})

  async function submit() {
    errors.value = {}
    const result = schema.safeParse({ email: email.value })
    if (!result.success) {
      result.error.issues.forEach((e) => { errors.value[String(e.path[0])] = e.message })
      return
    }

    loading.value = true
    try {
      await authService.forgotPassword(email.value)
      sent.value = true
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Erro ao enviar e-mail. Tente novamente.')
    } finally {
      loading.value = false
    }
  }

  return { loading, sent, email, errors, submit }
}
