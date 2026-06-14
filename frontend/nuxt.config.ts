import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css', 'vue-advanced-cropper/dist/style.css', 'flag-icons/css/flag-icons.min.css'],
  transpile: ['vue-advanced-cropper'],
  components: [{ path: '~/components', pathPrefix: false }],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['axios', 'vue-toastification', 'zod', '@lucide/vue', '@vueuse/core', 'vue-advanced-cropper'],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },
})
