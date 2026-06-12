<!-- frontend/components/ui/UiSkeleton.vue -->
<script setup lang="ts">
withDefaults(defineProps<{
  width?: string
  height?: string
  rounded?: string
}>(), {
  width: '100%',
  height: '14px',
  rounded: '4px',
})
</script>

<template>
  <div class="sk" :style="{ width, height, borderRadius: rounded }" />
</template>

<style scoped>
.sk {
  background: var(--bg-elevated);
  animation: sk-pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes sk-pulse {
  0%, 100% { opacity: 0.65; }
  50%       { opacity: 0.2;  }
}
</style>
