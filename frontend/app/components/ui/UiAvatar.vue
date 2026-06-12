<!-- frontend/components/ui/UiAvatar.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  name?: string
  size?: number
  color?: string
  src?: string
}>(), {
  name: '',
  size: 32,
  color: 'var(--red-500)',
})

const initials = computed(() =>
  props.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
)
</script>

<template>
  <span
    class="inline-flex items-center justify-center rounded-full overflow-hidden flex-none font-sans font-medium text-white leading-none"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: src ? 'transparent' : color,
      fontSize: `${Math.round(size * 0.4)}px`,
    }"
  >
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover" />
    <template v-else>{{ initials }}</template>
  </span>
</template>
