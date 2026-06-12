<script setup lang="ts">
import { useLoginController } from '~/composables/useLoginController'

definePageMeta({ layout: 'auth' })

const { mode, loading, name, email, password, errors, toggleMode, submit } = useLoginController()
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
      <p class="text-white/40 text-sm">© 2026 Payravel · Jordan Lippert</p>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-[360px]">
        <div class="lg:hidden mb-8 flex justify-center">
          <AppLogo :animated="false" :size="54" color="var(--red-500)" wordmark-color="white" />
        </div>

        <h2 class="text-white text-[22px] font-medium mb-2">
          {{ mode === 'login' ? 'Entrar na conta' : 'Criar conta' }}
        </h2>
        <p class="text-white/50 text-sm mb-8">
          {{ mode === 'login' ? 'Acesse seu painel de requisições.' : 'Comece a solicitar pagamentos hoje.' }}
        </p>

        <form @submit.prevent="submit" class="flex flex-col gap-[14px]">
          <UiInput
            v-if="mode === 'register'"
            label="Nome completo"
            v-model="name"
            placeholder="Marina Alves"
            :hint="errors.name"
          />
          <UiInput
            label="E-mail"
            type="email"
            v-model="email"
            placeholder="seu@email.com"
            :hint="errors.email"
          />
          <UiInput
            label="Senha"
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
              {{ mode === 'login' ? 'Entrar' : 'Registrar' }}
            </UiButton>
            <UiButton
              type="button"
              variant="ghost"
              @click="toggleMode"
            >
              {{ mode === 'login' ? 'Registrar' : 'Entrar' }}
            </UiButton>
          </div>
        </form>

        <div class="text-center mt-6" style="font-size: 13px; color: var(--text-muted);">
          <template v-if="mode === 'login'">
            Esqueceu a senha?
            <NuxtLink
              to="/forgot-password"
              class="ml-1 transition-colors hover:text-white"
              style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong);"
            >Recuperar acesso</NuxtLink>
          </template>
          <template v-else>
            Já tem conta?
            <span
              class="ml-1 cursor-pointer transition-colors hover:text-white"
              style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong);"
              @click="toggleMode"
            >Entrar</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
