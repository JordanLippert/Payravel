<!-- frontend/app/components/ui/UiPagination.vue -->
<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  lastPage: number
  loading?: boolean
}>()

const emit = defineEmits<{ change: [page: number] }>()

const pages = computed(() => {
  const delta = 2
  const start = Math.max(1, props.currentPage - delta)
  const end   = Math.min(props.lastPage, props.currentPage + delta)
  const range: number[] = []
  for (let i = start; i <= end; i++) range.push(i)
  return range
})

const showStartEllipsis = computed(() => pages.value[0] > 2)
const showEndEllipsis   = computed(() => pages.value[pages.value.length - 1] < props.lastPage - 1)
const showFirst         = computed(() => pages.value[0] > 1)
const showLast          = computed(() => pages.value[pages.value.length - 1] < props.lastPage)

function go(page: number) {
  if (page < 1 || page > props.lastPage || page === props.currentPage || props.loading) return
  emit('change', page)
}
</script>

<template>
  <div v-if="lastPage > 1" class="flex items-center justify-center" style="gap: 4px; padding: 16px 0;">
    <!-- Prev -->
    <button
      type="button"
      :disabled="currentPage === 1 || loading"
      style="height: 32px; min-width: 32px; padding: 0 10px; border-radius: 7px; font-size: 13px; cursor: pointer; transition: background 120ms; display: flex; align-items: center; justify-content: center;"
      :style="{
        background: 'var(--bg-input)',
        border: '0.5px solid var(--border-default)',
        color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
        opacity: currentPage === 1 ? 0.4 : 1,
      }"
      @click="go(currentPage - 1)"
    >‹</button>

    <!-- First page -->
    <button v-if="showFirst" type="button" @click="go(1)"
      style="height: 32px; min-width: 32px; border-radius: 7px; font-size: 13px; cursor: pointer; transition: background 120ms; display: flex; align-items: center; justify-content: center;"
      :style="{ background: 'var(--bg-input)', border: '0.5px solid var(--border-default)', color: 'var(--text-secondary)' }"
    >1</button>
    <span v-if="showStartEllipsis" style="font-size: 13px; color: var(--text-muted); padding: 0 2px;">…</span>

    <!-- Page numbers -->
    <button
      v-for="p in pages"
      :key="p"
      type="button"
      @click="go(p)"
      style="height: 32px; min-width: 32px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 120ms; display: flex; align-items: center; justify-content: center;"
      :style="{
        background: p === currentPage ? 'var(--text-primary)' : 'var(--bg-input)',
        border: `0.5px solid ${p === currentPage ? 'transparent' : 'var(--border-default)'}`,
        color: p === currentPage ? '#000' : 'var(--text-secondary)',
      }"
    >{{ p }}</button>

    <span v-if="showEndEllipsis" style="font-size: 13px; color: var(--text-muted); padding: 0 2px;">…</span>

    <!-- Last page -->
    <button v-if="showLast" type="button" @click="go(lastPage)"
      style="height: 32px; min-width: 32px; border-radius: 7px; font-size: 13px; cursor: pointer; transition: background 120ms; display: flex; align-items: center; justify-content: center;"
      :style="{ background: 'var(--bg-input)', border: '0.5px solid var(--border-default)', color: 'var(--text-secondary)' }"
    >{{ lastPage }}</button>

    <!-- Next -->
    <button
      type="button"
      :disabled="currentPage === lastPage || loading"
      style="height: 32px; min-width: 32px; padding: 0 10px; border-radius: 7px; font-size: 13px; cursor: pointer; transition: background 120ms; display: flex; align-items: center; justify-content: center;"
      :style="{
        background: 'var(--bg-input)',
        border: '0.5px solid var(--border-default)',
        color: currentPage === lastPage ? 'var(--text-muted)' : 'var(--text-secondary)',
        opacity: currentPage === lastPage ? 0.4 : 1,
      }"
      @click="go(currentPage + 1)"
    >›</button>
  </div>
</template>
