<script setup lang="ts">
import { useForgotPasswordController } from '~/composables/useForgotPasswordController'
import { useT } from '~/composables/useT'

definePageMeta({ layout: 'auth' })
const isMobile = useIsMobile()
const { t } = useT()

const { loading, sent, email, errors, submit } = useForgotPasswordController()
</script>

<template>
  <ForgotPasswordMobile v-if="isMobile" />
  <div v-else class="min-h-screen flex bg-[#0f0f0f]">
    <!-- Left panel -->
    <div class="hidden lg:flex flex-col justify-between w-[42%] bg-[#CC0000] py-14 px-12">
      <AppLogo :animated="false" color="white" knockout="#CC0000" wordmark-color="white" :size="54" />
      <div>
        <h1 class="text-white text-[40px] font-medium leading-tight mb-4 tracking-tight">
          {{ t('auth.login.heroTitle') }}
        </h1>
        <p class="text-white/70 text-base">
          {{ t('auth.login.heroSub') }}
        </p>
      </div>
      <p class="text-white/40 text-sm">© 2026 Payravel · Jordan Lippert</p>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-[360px]">
        <div class="lg:hidden mb-8 flex justify-center">
          <AppLogo :animated="false" :size="54" color="var(--red-500)" wordmark-color="white" />
        </div>

        <template v-if="!sent">
          <h2 class="text-white text-[22px] font-medium mb-2">{{ t('auth.forgot.title') }}</h2>
          <p class="text-white/50 text-sm mb-8">
            {{ t('auth.forgot.subtitle') }}
          </p>

          <form @submit.prevent="submit" class="flex flex-col gap-[14px]">
            <UiInput
              :label="t('auth.forgot.emailLabel')"
              type="email"
              v-model="email"
              placeholder="seu@email.com"
              :hint="errors.email"
            />

            <div class="flex gap-[10px] mt-2">
              <UiButton type="submit" variant="primary" class="flex-1" :loading="loading">
                {{ t('auth.forgot.submit') }}
              </UiButton>
            </div>
          </form>
        </template>

        <template v-else>
          <h2 class="text-white text-[22px] font-medium mb-2">{{ t('auth.forgot.successTitle') }}</h2>
          <p class="text-white/50 text-sm mb-8">
            {{ t('auth.forgot.successMessage', { email: email }) }}
          </p>
        </template>

        <div class="text-center mt-6" style="font-size: 13px; color: var(--text-muted);">
          <NuxtLink
            to="/login"
            class="transition-colors hover:text-white"
            style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong);"
          >{{ t('auth.forgot.backToLogin') }}</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
