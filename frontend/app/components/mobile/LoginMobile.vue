<!-- app/components/mobile/LoginMobile.vue -->
<script setup lang="ts">
import { useLoginController } from '~/composables/useLoginController'
import { useT } from '~/composables/useT'

const { mode, loading, name, email, password, errors, toggleMode, submit } = useLoginController()
const { t } = useT()

const tabs = computed(() => [['login', t('auth.login.submit')], ['register', t('auth.register.submit')]] as const)
</script>

<template>
  <div class="flex flex-col" style="min-height: 100dvh; background: var(--red-500);">
    <!-- Red hero -->
    <div style="padding: 36px 24px 52px; display: flex; flex-direction: column; gap: 24px; color: #fff;">
      <AppLogo :size="40" color="#fff" knockout="#CC0000" wordmark-color="#fff" />
      <div>
        <h1 style="font-size: 30px; font-weight: 500; line-height: 1.15; letter-spacing: -0.02em; margin: 0;">
          {{ t('auth.login.heroTitle') }}
        </h1>
        <p style="font-size: 14px; line-height: 1.55; color: rgba(255,255,255,0.8); margin-top: 12px; max-width: 280px;">
          {{ t('auth.register.heroSub') }}
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
        gap: 20px;
        border-top: 0.5px solid var(--border-default);
      "
    >
      <!-- Segment control -->
      <div style="display: flex; gap: 4px; background: var(--bg-input); border-radius: 11px; padding: 3px;">
        <button
          v-for="[id, lbl] in tabs"
          :key="id"
          type="button"
          style="flex: 1; padding: 9px 0; border-radius: 8px; border: none; cursor: pointer; font-family: var(--font-sans); font-size: 13.5px; font-weight: 500; transition: background 120ms, color 120ms;"
          :style="{
            background: mode === id ? 'var(--bg-elevated)' : 'transparent',
            color: mode === id ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }"
          @click="mode !== id && toggleMode()"
        >{{ lbl }}</button>
      </div>

      <!-- Form fields -->
      <form class="flex flex-col" style="gap: 13px;" @submit.prevent="submit">
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
          placeholder="voce@empresa.com"
          :hint="errors.email"
        />
        <UiInput
          :label="t('auth.login.passwordLabel')"
          type="password"
          v-model="password"
          placeholder="••••••••"
          :hint="errors.password"
        />

        <UiButton variant="primary" size="lg" type="submit" :loading="loading" class="w-full mt-1">
          {{ mode === 'login' ? t('auth.login.submit') : t('auth.login.register') }}
        </UiButton>
      </form>

      <div style="font-size: 12.5px; color: var(--text-muted); text-align: center; margin-top: auto;">
        <template v-if="mode !== 'login'">
          {{ t('auth.register.hasAccount') }}&nbsp;
          <span style="color: var(--text-secondary); border-bottom: 0.5px solid var(--border-strong); cursor: pointer;" @click="toggleMode">
            {{ t('auth.register.login') }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
