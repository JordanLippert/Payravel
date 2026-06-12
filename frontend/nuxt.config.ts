import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['axios', 'vue-toastification', 'zod', '@lucide/vue', '@vueuse/core'],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },
})
