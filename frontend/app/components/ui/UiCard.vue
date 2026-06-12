<!-- frontend/components/ui/UiCard.vue -->
<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean; overflow?: boolean }>(), { padded: true, overflow: true })
</script>

<template>
  <div
    class="rounded-md"
    :class="[padded ? 'p-5' : 'p-0', overflow ? 'overflow-hidden' : 'overflow-visible']"
    style="background: var(--surface-card); border: 0.5px solid var(--border-subtle);"
  >
    <slot />
  </div>
</template>
