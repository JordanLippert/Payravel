<!-- frontend/components/ui/UiSelect.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown } from '@lucide/vue'

export interface SelectOption {
  value: string
  label: string
  flag?: string
  meta?: string
}

const props = withDefaults(defineProps<{
  label?: string
  modelValue?: string
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  hint?: string
}>(), {
  options: () => [],
  placeholder: 'Selecionar',
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const open = ref(false)
const containerRef = ref<HTMLElement>()

onClickOutside(containerRef, () => { open.value = false })

const selected = computed(() => props.options.find(o => o.value === props.modelValue))
</script>

<template>
  <div class="flex flex-col gap-1.5" ref="containerRef">
    <span v-if="label" class="text-xs font-medium font-sans" style="color: var(--text-tertiary);">{{ label }}</span>
    <div class="relative">
      <button
        type="button"
        :disabled="disabled"
        class="pv-select-btn w-full flex items-center gap-2 h-[38px] px-3 rounded-sm border-[0.5px] text-sm font-sans transition-colors duration-[120ms] disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{
          background: 'var(--bg-input)',
          borderColor: open ? 'var(--red-border)' : 'var(--border-default)',
        }"
        @click="open = !open"
      >
        <span v-if="selected" class="flex items-center gap-2 flex-1" style="color: var(--text-primary);">
          <span v-if="selected.flag" class="text-base leading-none">{{ selected.flag }}</span>
          <span>{{ selected.label }}</span>
        </span>
        <span v-else class="flex-1 text-left" style="color: var(--text-muted);">{{ placeholder }}</span>
        <ChevronDown
          :size="14"
          class="ml-auto flex-none transition-transform duration-[120ms]"
          :class="open && 'rotate-180'"
          style="color: var(--text-muted);"
        />
      </button>

      <Transition name="dropdown">
        <div
          v-if="open"
          class="absolute top-[calc(100%+4px)] left-0 right-0 z-20 rounded-md border-[0.5px] p-1 max-h-60 overflow-y-auto"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-menu)' }"
        >
          <div
            v-for="option in options"
            :key="option.value"
            class="flex items-center gap-2 px-2.5 py-2 rounded-sm text-sm font-sans cursor-pointer transition-colors duration-[120ms]"
            :style="{ color: 'var(--text-primary)' }"
            :class="option.value === modelValue ? 'bg-white/[0.06]' : 'hover:bg-white/[0.06]'"
            @click="emit('update:modelValue', option.value); open = false"
          >
            <span v-if="option.flag" class="text-base leading-none">{{ option.flag }}</span>
            <span>{{ option.label }}</span>
            <span v-if="option.meta" class="ml-auto text-xs font-mono" style="color: var(--text-muted);">{{ option.meta }}</span>
          </div>
        </div>
      </Transition>
    </div>
    <span v-if="hint" class="text-xs font-sans" style="color: var(--status-rejected-fg);">{{ hint }}</span>
  </div>
</template>

<style scoped>
.pv-select-btn:hover:not(:disabled) { border-color: var(--red-border) !important; }
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 120ms ease, transform 120ms ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
