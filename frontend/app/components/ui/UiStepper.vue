<!-- frontend/components/ui/UiStepper.vue -->
<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Step { title: string; desc?: string }

withDefaults(defineProps<{
  steps: Step[]
  current?: number
}>(), { current: 0 })
</script>

<template>
  <div class="flex flex-col gap-0">
    <div v-for="(step, i) in steps" :key="i" class="flex gap-3 relative">
      <div class="flex flex-col items-center">
        <span
          class="w-[26px] h-[26px] rounded-full flex-none inline-flex items-center justify-center text-xs font-medium font-sans transition-colors duration-[120ms]"
          :style="{
            background: i < current ? 'var(--red-500)' : 'transparent',
            color: i < current ? '#fff' : i === current ? 'var(--red-500)' : 'var(--text-muted)',
            border: `0.5px solid ${i < current ? 'var(--red-500)' : i === current ? 'var(--red-border)' : 'var(--border-default)'}`,
          }"
        >{{ i < current ? '✓' : i + 1 }}</span>
        <span
          v-if="i < steps.length - 1"
          class="w-px flex-1 min-h-7"
          :style="{ background: i < current ? 'var(--red-border)' : 'var(--border-default)' }"
        />
      </div>
      <div :class="cn('pt-[3px]', i < steps.length - 1 && 'pb-[22px]')">
        <div
          class="text-sm font-sans"
          :style="{
            fontWeight: i === current ? 500 : 400,
            color: i <= current ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }"
        >{{ step.title }}</div>
        <div v-if="step.desc" class="text-xs font-sans mt-0.5" style="color: var(--text-muted);">{{ step.desc }}</div>
      </div>
    </div>
  </div>
</template>
