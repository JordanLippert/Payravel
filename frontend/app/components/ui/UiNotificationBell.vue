<!-- frontend/app/components/ui/UiNotificationBell.vue -->
<script setup lang="ts">
import { Bell } from '@lucide/vue'
import { onClickOutside } from '@vueuse/core'
import { useNotificationsController } from '~/composables/useNotificationsController'

const isMobile = useIsMobile()
const { recentList, unreadCount, isOpen, loading, toggle, close, markRead, markAllRead } = useNotificationsController()

const wrapperRef = ref<HTMLElement>()
onClickOutside(wrapperRef, () => { if (isOpen.value) close() })
</script>

<template>
  <div ref="wrapperRef" style="position: relative;">
    <button
      type="button"
      style="background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 11px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;"
      @click="toggle"
    >
      <Bell :size="18" style="color: var(--text-secondary);" :stroke-width="1.8" />
      <span
        v-if="unreadCount > 0"
        style="position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 999px; background: var(--red-500); border: 1.5px solid var(--bg-surface);"
      />
    </button>

    <UiNotificationDropdown
      v-if="!isMobile && isOpen"
      :notifications="recentList"
      :loading="loading"
      @close="close"
      @mark-read="markRead"
      @mark-all-read="markAllRead"
    />

    <UiNotificationDrawer
      v-if="isMobile && isOpen"
      :notifications="recentList"
      :loading="loading"
      @close="close"
      @mark-read="markRead"
      @mark-all-read="markAllRead"
    />
  </div>
</template>
