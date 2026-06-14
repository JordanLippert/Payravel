<script setup lang="ts">
import { useLoginController } from '~/composables/useLoginController'
import { useT } from '~/composables/useT'

definePageMeta({ layout: 'auth' })
const isMobile = useIsMobile()
const { t } = useT()

const { mode, loading, name, email, password, errors, toggleMode, submit } = useLoginController()
</script>

<template>
  <LoginMobile v-if="isMobile" />

  <div v-else>
  <div class="min-h-screen flex bg-[#0f0f0f]">
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

        <h2 class="text-white text-[22px] font-medium mb-2">
          {{ mode === 'login' ? t('auth.login.title') : t('auth.register.title') }}
        </h2>
        <p class="text-white/50 text-sm mb-8">
          {{ mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle') }}
        </p>

        <form @submit.prevent="submit" class="flex flex-col gap-[14px]">
          <UiInput
            v-if="mode === 'register'"
            :label="t('auth.register.nameLabel')"
            v-model="name"
            placeholder="Marina Alves"
            :hint="errors.name"
          />
          <UiInput
            :label="t('auth.login.emailLabel')"
            type="email"
            v-model="email"
            placeholder="seu@email.com"
            :hint="errors.email"
          />
          <UiInput
            :label="t('auth.login.passwordLabel')"
            type="password"
            v-model="password"
            placeholder="••••••••"
            :hint="errors.password"
          />

          <div class="flex gap-[10px] mt-2">
            <UiButton
              type="submit"
              variant="primary"
              class="flex-1"
              :loading="loading"
            >
              {{ mode === 'login' ? t('auth.login.submit') : t('auth.register.submit') }}
            </UiButton>
            <UiButton
              type="button"
              variant="ghost"
              @click="toggleMode"
            >
              {{ mode === 'login' ? t('auth.register.submit') : t('auth.register.login') }}
            </UiButton>
          </div>
        </form>

        <div class="text-center mt-6" style="font-size: 13px; color: var(--text-muted);">
          <template v-if="mode === 'login'">
            {{ t('auth.login.forgotPassword') }}
            <NuxtLink
              to="/forgot-password"
              class="ml-1 transition-colors hover:text-white"
              style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong);"
            >{{ t('auth.forgot.title') }}</NuxtLink>
          </template>
          <template v-else>
            {{ t('auth.register.hasAccount') }}
            <span
              class="ml-1 cursor-pointer transition-colors hover:text-white"
              style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong);"
              @click="toggleMode"
            >{{ t('auth.register.login') }}</span>
          </template>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
