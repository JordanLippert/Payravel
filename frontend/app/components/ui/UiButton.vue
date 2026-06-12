<!-- frontend/components/ui/UiButton.vue -->
<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  fullWidth: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{ click: [e: MouseEvent] }>()

const sizeMap = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-[38px] px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
} as const
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="(e) => emit('click', e)"
    :class="[
      'inline-flex items-center justify-center gap-2 font-sans font-medium',
      'rounded-sm border-[0.5px] whitespace-nowrap select-none',
      'transition-colors duration-[120ms] ease-linear',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      sizeMap[size],
      fullWidth && 'w-full',
      variant === 'primary' && 'bg-accent text-white border-transparent hover:bg-accent-hover active:bg-accent-pressed',
      variant === 'ghost' && 'bg-transparent text-white border-[rgba(255,255,255,0.10)] hover:bg-white/[0.06] hover:border-[rgba(255,255,255,0.15)]',
      variant === 'danger' && 'bg-status-rejected text-white border-transparent hover:bg-[#d83a3a] active:bg-[#c23030]',
    ]"
  >
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </button>
</template>
