import { notificationsService, type AppNotification } from '~/services/notificationsService'

export function useNotificationsController() {
  const recentList  = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const isOpen      = ref(false)
  const loading     = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null

  function scheduleNextPoll() {
    timer = setTimeout(async () => {
      try { unreadCount.value = await notificationsService.unreadCount() } catch { /* silent */ }
      scheduleNextPoll()
    }, 30_000)
  }

  async function open() {
    isOpen.value = true
    loading.value = true
    try {
      recentList.value = await notificationsService.recent()
    } catch { /* silent */ }
    finally { loading.value = false }
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    if (isOpen.value) close()
    else open()
  }

  async function markRead(id: string) {
    try {
      await notificationsService.markRead(id)
      recentList.value = recentList.value.map(n =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
      if (unreadCount.value > 0) unreadCount.value--
    } catch { /* silent */ }
  }

  async function markAllRead() {
    try {
      await notificationsService.markAllRead()
      recentList.value = recentList.value.map(n => ({ ...n, read_at: new Date().toISOString() }))
      unreadCount.value = 0
    } catch { /* silent */ }
  }

  onMounted(async () => {
    try { unreadCount.value = await notificationsService.unreadCount() } catch { /* silent */ }
    scheduleNextPoll()
  })

  onUnmounted(() => {
    if (timer) { clearTimeout(timer); timer = null }
  })

  return { recentList, unreadCount, isOpen, loading, open, close, toggle, markRead, markAllRead }
}
