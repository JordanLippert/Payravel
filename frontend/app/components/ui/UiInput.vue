<!-- frontend/components/ui/UiInput.vue -->
<script setup lang="ts">
import { cn } from '~/utils/cn'
import { Eye, EyeOff } from '@lucide/vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  label?: string
  hint?: string
  hintMuted?: boolean
  modelValue?: string | number
  placeholder?: string
  type?: string
  readonly?: boolean
  disabled?: boolean
  mono?: boolean
  prefix?: string
  suffix?: string
}>()

defineEmits<{ 'update:modelValue': [v: string] }>()

const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => {
  if (isPassword.value) return showPassword.value ? 'text' : 'password'
  return props.type || 'text'
})
</script>

<template>
  <label class="flex flex-col gap-1.5">
    <span v-if="label" class="text-xs font-medium font-sans" style="color: var(--text-tertiary);">{{ label }}</span>
    <div
      class="pv-input-wrap flex items-center gap-2 h-[38px] px-3 rounded-sm border-[0.5px] transition-colors duration-[120ms]"
      :style="{
        background: readonly ? 'rgba(255,255,255,0.02)' : 'var(--bg-input)',
        borderColor: 'var(--border-default)',
        opacity: disabled ? 0.4 : 1,
      }"
    >
      <span v-if="prefix" class="text-sm flex-none" style="color: var(--text-tertiary);">{{ prefix }}</span>
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        v-bind="$attrs"
        :class="cn('flex-1 min-w-0 bg-transparent border-none outline-none text-sm', mono ? 'font-mono tabular-nums' : 'font-sans')"
        style="color: var(--text-primary);"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        tabindex="-1"
        class="flex items-center bg-transparent border-none cursor-pointer p-0 flex-none"
        style="color: var(--text-muted);"
        @mouseenter="($event.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.color = 'var(--text-muted)'"
        @click.stop="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" :size="15" />
        <Eye v-else :size="15" />
      </button>
      <span v-else-if="suffix || $slots['suffix']" class="flex items-center flex-none text-xs font-mono">
        <slot name="suffix"><span style="color: var(--status-approved-fg);">{{ suffix }}</span></slot>
      </span>
    </div>
    <span v-if="hint" class="text-xs font-sans" :style="{ color: hintMuted ? 'var(--text-muted)' : 'var(--status-rejected-fg)' }">{{ hint }}</span>
  </label>
</template>

<style scoped>
.pv-input-wrap:hover,
.pv-input-wrap:focus-within {
  border-color: var(--red-border) !important;
}
.pv-input-wrap input::placeholder {
  color: var(--text-muted);
}
</style>
