<script setup lang="ts">
import { useLocaleStore } from '~/stores/locale'

const localeStore = useLocaleStore()
</script>

<template>
  <button
    type="button"
    style="
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: var(--bg-input);
      border: 0.5px solid var(--border-default);
      border-radius: 8px;
      padding: 4px 8px;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      transition: background 120ms, border-color 120ms;
    "
    @click="localeStore.toggleLocale()"
  >
    <span :style="{ color: localeStore.locale === 'pt' ? 'var(--text-primary)' : 'var(--text-muted)' }">PT</span>
    <span style="color: var(--border-strong); margin: 0 1px;">|</span>
    <span :style="{ color: localeStore.locale === 'en' ? 'var(--text-primary)' : 'var(--text-muted)' }">EN</span>
  </button>
</template>
