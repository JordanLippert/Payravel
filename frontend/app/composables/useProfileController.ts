import { ref, reactive } from 'vue'
import { userService, type UserProfile } from '~/services/userService'
import { useAuthStore } from '~/stores/auth'
import { useToast } from 'vue-toastification'
import { CURRENCIES } from '~/config/constants'

export function useProfileController() {
  const auth = useAuthStore()
  const toast = useToast()

  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)

  const infoForm = reactive({ name: '', email: '', currency: '' })
  const infoSaving = ref(false)
  const infoErrors = ref<Record<string, string>>({})

  const passForm = reactive({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const passSaving = ref(false)
  const passErrors = ref<Record<string, string>>({})

  const showCropModal = ref(false)
  const cropSrc = ref<string>('')
  const avatarUploading = ref(false)

  async function fetchProfile() {
    loading.value = true
    try {
      profile.value = await userService.get()
      infoForm.name = profile.value.name
      infoForm.email = profile.value.email
      infoForm.currency = profile.value.currency
    } catch {
      toast.error('Erro ao carregar perfil.')
    } finally {
      loading.value = false
    }
  }

  async function saveInfo() {
    infoErrors.value = {}
    infoSaving.value = true
    try {
      const updated = await userService.update({
        name: infoForm.name,
        email: infoForm.email,
        currency: infoForm.currency,
      })
      profile.value = updated
      if (auth.user) {
        auth.user = {
          ...auth.user,
          name: updated.name,
          email: updated.email,
          currency: updated.currency,
        }
      }
      toast.success('Perfil atualizado.')
    } catch (err: any) {
      const errs = err?.response?.data?.errors
      if (errs) {
        infoErrors.value = Object.fromEntries(
          Object.entries(errs).map(([k, v]) => [k, (v as string[])[0]])
        )
      } else {
        toast.error('Erro ao salvar perfil.')
      }
    } finally {
      infoSaving.value = false
    }
  }

  async function savePassword() {
    passErrors.value = {}
    passSaving.value = true
    try {
      await userService.changePassword({ ...passForm })
      passForm.current_password = ''
      passForm.password = ''
      passForm.password_confirmation = ''
      toast.success('Senha alterada.')
    } catch (err: any) {
      const errs = err?.response?.data?.errors
      if (errs) {
        passErrors.value = Object.fromEntries(
          Object.entries(errs).map(([k, v]) => [k, (v as string[])[0]])
        )
      } else {
        toast.error('Erro ao alterar senha.')
      }
    } finally {
      passSaving.value = false
    }
  }

  function openFilePicker() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        cropSrc.value = ev.target?.result as string
        showCropModal.value = true
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  async function confirmCrop(blob: Blob) {
    showCropModal.value = false
    avatarUploading.value = true
    try {
      const updated = await userService.uploadAvatar(blob)
      profile.value = updated
      if (auth.user) {
        auth.user = { ...auth.user, avatar_url: updated.avatar_url }
      }
      toast.success('Foto atualizada.')
    } catch {
      toast.error('Erro ao salvar foto.')
    } finally {
      avatarUploading.value = false
    }
  }

  function cancelCrop() {
    showCropModal.value = false
    cropSrc.value = ''
  }

  onMounted(fetchProfile)

  return {
    profile, loading,
    infoForm, infoSaving, infoErrors, saveInfo,
    passForm, passSaving, passErrors, savePassword,
    showCropModal, cropSrc, avatarUploading,
    openFilePicker, confirmCrop, cancelCrop,
    CURRENCIES,
  }
}
