<!-- frontend/components/brand/AppLogo.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'mark' | 'lockup' | 'stacked'
  size?: number
  color?: string
  knockout?: string
  wordmarkColor?: string
  animated?: boolean
}>(), {
  variant: 'lockup',
  size: 28,
  color: 'var(--red-500)',
  knockout: '#000',
  wordmarkColor: 'var(--text-primary)',
  animated: false,
})

const uid = useId()
const r = 17, fs = 12
const eg = { x: 32 - r * 0.32, y: 32 - r * 0.32 + fs * 0.36 }
const dg = { x: 32 + r * 0.36, y: 32 + r * 0.36 + fs * 0.36 }
const sw = 2.3
const wordmarkSize = computed(() => props.size * 0.62)
const gap = computed(() => props.variant === 'stacked' ? props.size * 0.2 : props.size * 0.16)
</script>

<template>
  <span
    class="inline-flex items-center"
    :style="{
      flexDirection: variant === 'stacked' ? 'column' : 'row',
      gap: `${gap}px`,
    }"
  >
    <svg
      viewBox="0 0 64 64"
      :width="size"
      :height="size"
      style="display:block;overflow:visible"
      aria-label="Payravel"
    >
      <defs>
        <clipPath :id="`ul-${uid}`">
          <polygon points="-4,-4 68,-4 -4,68" />
        </clipPath>
      </defs>
      <g>
        <animateTransform
          v-if="animated"
          attributeName="transform"
          type="rotate"
          from="0 32 32"
          to="360 32 32"
          dur="5s"
          repeatCount="indefinite"
        />
        <path d="M40.2 9.45 A24 24 0 0 1 40.2 54.55" fill="none" :stroke="color" :stroke-width="sw" stroke-linecap="round" />
        <path d="M42.6 49.4 L40.2 54.55 L45.3 57" fill="none" :stroke="color" :stroke-width="sw" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M23.8 54.55 A24 24 0 0 1 23.8 9.45" fill="none" :stroke="color" :stroke-width="sw" stroke-linecap="round" />
        <path d="M21.4 14.6 L23.8 9.45 L18.7 7" fill="none" :stroke="color" :stroke-width="sw" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <circle cx="32" cy="32" :r="r" :fill="color" :clip-path="`url(#ul-${uid})`" />
      <text :x="eg.x" :y="eg.y" font-family="Geist, sans-serif" :font-size="fs" font-weight="500" :fill="knockout" text-anchor="middle">€</text>
      <text :x="dg.x" :y="dg.y" font-family="Geist, sans-serif" :font-size="fs" font-weight="500" :fill="color" text-anchor="middle">$</text>
    </svg>
    <span
      v-if="variant !== 'mark'"
      class="font-sans font-medium leading-none"
      :style="{
        fontSize: `${wordmarkSize}px`,
        letterSpacing: '-0.03em',
        color: wordmarkColor,
      }"
    >Payravel</span>
  </span>
</template>
