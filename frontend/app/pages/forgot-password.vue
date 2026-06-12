<script setup lang="ts">
import { useForgotPasswordController } from '~/composables/useForgotPasswordController'

definePageMeta({ layout: 'auth' })

const { loading, sent, email, errors, submit } = useForgotPasswordController()
</script>

<template>
  <div class="min-h-screen flex bg-[#0f0f0f]">
    <!-- Left panel -->
    <div class="hidden lg:flex flex-col justify-between w-[42%] bg-[#CC0000] py-14 px-12">
      <AppLogo :animated="false" color="white" knockout="#CC0000" wordmark-color="white" :size="54" />
      <div>
        <h1 class="text-white text-[40px] font-medium leading-tight mb-4 tracking-tight">
          Pagamentos multi-moeda,<br>sem fronteiras.
        </h1>
        <p class="text-white/70 text-base">
          Solicite, converta e aprove reembolsos da sua equipe global — câmbio ao vivo, tudo em EUR.
        </p>
      </div>
      <p class="text-white/40 text-sm">© 2026 Payravel · Buzzvel</p>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-[360px]">
        <div class="lg:hidden mb-8 flex justify-center">
          <AppLogo :animated="false" :size="54" color="var(--red-500)" wordmark-color="white" />
        </div>

        <template v-if="!sent">
          <h2 class="text-white text-[22px] font-medium mb-2">Recuperar acesso</h2>
          <p class="text-white/50 text-sm mb-8">
            Informe seu e-mail para receber o link de recuperação.
          </p>

          <form @submit.prevent="submit" class="flex flex-col gap-[14px]">
            <UiInput
              label="E-mail"
              type="email"
              v-model="email"
              placeholder="seu@email.com"
              :hint="errors.email"
            />

            <div class="flex gap-[10px] mt-2">
              <UiButton type="submit" variant="primary" class="flex-1" :loading="loading">
                Enviar link
              </UiButton>
            </div>
          </form>
        </template>

        <template v-else>
          <h2 class="text-white text-[22px] font-medium mb-2">E-mail enviado</h2>
          <p class="text-white/50 text-sm mb-8">
            Verifique sua caixa de entrada. O link de recuperação foi enviado para <span class="text-white/80">{{ email }}</span>.
          </p>
        </template>

        <div class="text-center mt-6" style="font-size: 13px; color: var(--text-muted);">
          <NuxtLink
            to="/login"
            class="transition-colors hover:text-white"
            style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong);"
          >← Voltar para login</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
