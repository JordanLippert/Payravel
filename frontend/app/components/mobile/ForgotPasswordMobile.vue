<!-- app/components/mobile/ForgotPasswordMobile.vue -->
<script setup lang="ts">
import { Check } from '@lucide/vue'
import { useForgotPasswordController } from '~/composables/useForgotPasswordController'

const { loading, sent, email, errors, submit } = useForgotPasswordController()
</script>

<template>
  <div class="flex flex-col" style="min-height: 100dvh; background: var(--red-500);">
    <!-- Red hero -->
    <div style="padding: 36px 24px 52px; display: flex; flex-direction: column; gap: 24px; color: #fff;">
      <AppLogo :size="40" color="#fff" knockout="#CC0000" wordmark-color="#fff" />
      <div>
        <h1 style="font-size: 28px; font-weight: 500; line-height: 1.2; letter-spacing: -0.02em; margin: 0;">
          Recuperar<br>acesso
        </h1>
        <p style="font-size: 13.5px; color: rgba(255,255,255,0.78); margin-top: 10px; line-height: 1.6;">
          Informe seu e-mail e enviaremos<br>um link de redefinição.
        </p>
      </div>
    </div>

    <!-- Dark sheet -->
    <div
      class="flex-1 flex flex-col"
      style="
        background: var(--bg-base);
        border-top-left-radius: 26px;
        border-top-right-radius: 26px;
        margin-top: -24px;
        padding: 28px 22px 36px;
        gap: 16px;
        border-top: 0.5px solid var(--border-default);
      "
    >
      <template v-if="!sent">
        <form class="flex flex-col" style="gap: 13px;" @submit.prevent="submit">
          <UiInput
            label="E-mail"
            type="email"
            v-model="email"
            placeholder="voce@empresa.com"
            :hint="errors.email"
          />
          <UiButton variant="primary" size="lg" type="submit" :loading="loading" class="w-full mt-1">
            Enviar link
          </UiButton>
        </form>
      </template>

      <template v-else>
        <!-- Success state -->
        <div
          style="
            display: flex; gap: 10px; align-items: flex-start;
            background: var(--status-approved-bg);
            border: 0.5px solid var(--status-approved-border);
            border-radius: 13px;
            padding: 14px 16px;
          "
        >
          <Check :size="16" style="color: var(--status-approved-fg); flex: none; margin-top: 1px;" :stroke-width="2.4" />
          <div>
            <div style="font-size: 13px; color: var(--status-approved-fg); font-weight: 500;">Link enviado</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
              Verifique sua caixa de entrada para <span style="color: var(--text-secondary);">{{ email }}</span>.
            </div>
          </div>
        </div>
      </template>

      <div style="font-size: 12.5px; color: var(--text-muted); text-align: center; margin-top: auto;">
        <NuxtLink to="/login" style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong);">
          ← Voltar para login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
