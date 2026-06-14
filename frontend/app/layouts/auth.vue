<!-- frontend/layouts/auth.vue -->
<template>
  <div class="min-h-screen" style="background: var(--bg-base); font-family: var(--font-sans); position: relative;">
    <div style="position: absolute; top: 16px; right: 16px; z-index: 10;">
      <UiLangToggle />
    </div>
    <slot />
  </div>
</template>
