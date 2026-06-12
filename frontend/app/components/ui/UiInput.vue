<!-- frontend/components/ui/UiInput.vue -->
<script setup lang="ts">
defineProps<{
  label?: string
  hint?: string
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
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :class="[
          'flex-1 min-w-0 bg-transparent border-none outline-none text-sm',
          mono ? 'font-mono tabular-nums' : 'font-sans',
        ]"
        style="color: var(--text-primary);"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="suffix" class="flex items-center flex-none text-xs font-mono" style="color: var(--status-approved-fg);">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>
    <span v-if="hint" class="text-xs font-sans" style="color: var(--status-rejected-fg);">{{ hint }}</span>
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
