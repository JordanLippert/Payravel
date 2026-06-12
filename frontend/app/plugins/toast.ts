// frontend/app/plugins/toast.ts
import Toast, { POSITION, type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const options: PluginOptions = {
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  position: POSITION.TOP_RIGHT,
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, options)
})
