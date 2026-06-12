<!-- frontend/components/ui/UiPill.vue -->
<script setup lang="ts">
const props = defineProps<{
  name?: string
  role?: string | null
}>()

const isElevated = computed(() => !!props.role)
</script>

<template>
  <span
    class="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full font-sans cursor-default border-[0.5px]"
    :style="{
      background: isElevated ? 'var(--red-500)' : 'var(--bg-input)',
      borderColor: isElevated ? 'transparent' : 'var(--border-default)',
    }"
  >
    <UiAvatar
      :name="name || ''"
      :size="26"
      :color="isElevated ? 'rgba(0,0,0,0.25)' : 'var(--red-500)'"
    />
    <span class="flex flex-col leading-tight">
      <span
        class="text-[13px] font-medium"
        :style="{ color: isElevated ? '#fff' : 'var(--text-primary)' }"
      >{{ name }}</span>
      <span v-if="role" class="text-[11px]" style="color: rgba(255,255,255,0.8)">{{ role }}</span>
    </span>
  </span>
</template>
