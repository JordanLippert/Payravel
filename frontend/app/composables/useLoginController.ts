import { z } from 'zod'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '~/stores/auth'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export function useLoginController() {
  const auth = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const mode = ref<'login' | 'register'>('login')
  const loading = ref(false)
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const errors = ref<Record<string, string>>({})

  function toggleMode() {
    mode.value = mode.value === 'login' ? 'register' : 'login'
    errors.value = {}
    name.value = ''
    email.value = ''
    password.value = ''
  }

  async function submit() {
    errors.value = {}
    loading.value = true
    try {
      if (mode.value === 'login') {
        const result = loginSchema.safeParse({ email: email.value, password: password.value })
        if (!result.success) {
          result.error.issues.forEach((e) => { errors.value[String(e.path[0])] = e.message })
          return
        }
        await auth.login(email.value, password.value)
      } else {
        const result = registerSchema.safeParse({
          name: name.value,
          email: email.value,
          password: password.value,
        })
        if (!result.success) {
          result.error.issues.forEach((e) => { errors.value[String(e.path[0])] = e.message })
          return
        }
        await auth.register(name.value, email.value, password.value)
      }
      await router.push('/')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Erro ao autenticar. Verifique suas credenciais.')
    } finally {
      loading.value = false
    }
  }

  return { mode, loading, name, email, password, errors, toggleMode, submit }
}
