<script setup lang="ts">
import { useRequestDetailController } from '~/composables/useRequestDetailController'
import { useAuthStore } from '~/stores/auth'
import { useT } from '~/composables/useT'

definePageMeta({ middleware: 'auth' })
const isMobile = useIsMobile()

const { request, loading, timeline, formatEur, formatDate } = useRequestDetailController()
const auth = useAuthStore()
const { t } = useT()

const nav = computed(() => [
  { label: t('nav.dashboard'), to: '/' },
  { label: t('nav.requests'), to: '/requests/new' },
  { label: t('nav.history'), to: '/history' },
])
</script>

<template>
  <div>
    <DetailMobile v-if="isMobile" />
    <div v-else>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '' }" />

    <main class="px-8 py-8" style="max-width: 1000px; margin: 0 auto;">
      <button
        type="button"
        class="inline-block mb-[18px] text-[13px] transition-colors bg-transparent border-none p-0 cursor-pointer"
        style="color: var(--text-tertiary);"
        @mouseenter="($event.target as HTMLElement).style.color = 'var(--text-secondary)'"
        @mouseleave="($event.target as HTMLElement).style.color = 'var(--text-tertiary)'"
        @click="$router.back()"
      >{{ t('requests.detail.backLink') }}</button>

      <!-- Skeleton -->
      <div v-if="loading" class="grid gap-6" style="grid-template-columns: 1fr 320px;">
        <div class="flex flex-col gap-5">
          <!-- EUR amount card skeleton -->
          <UiCard :padded="false">
            <div style="padding: 28px;">
              <UiSkeleton width="148px" height="13px" />
              <UiSkeleton width="72%" height="52px" rounded="6px" style="margin-top: 14px;" />
              <UiSkeleton width="110px" height="13px" style="margin-top: 12px;" />
            </div>
          </UiCard>
          <!-- Conversion details card skeleton -->
          <UiCard :padded="false">
            <div style="padding: 8px 24px 16px;">
              <UiSkeleton width="130px" height="13px" style="margin: 16px 0 18px;" />
              <div
                v-for="(w, i) in ['90px','110px','100px','80px','90px','110px']"
                :key="i"
                class="flex justify-between items-center"
                style="padding: 13px 0;"
                :style="{ borderBottom: i < 5 ? '0.5px solid var(--border-subtle)' : 'none' }"
              >
                <UiSkeleton width="96px" height="12px" />
                <UiSkeleton :width="w" height="12px" />
              </div>
            </div>
          </UiCard>
        </div>
        <!-- Timeline card skeleton -->
        <UiCard style="height: fit-content;">
          <UiSkeleton width="72px" height="14px" style="margin-bottom: 24px;" />
          <div class="flex flex-col gap-0">
            <div v-for="(w, i) in ['120px','96px','104px','130px']" :key="i" class="flex gap-3">
              <div class="flex flex-col items-center">
                <UiSkeleton width="12px" height="12px" rounded="50%" style="margin-top: 3px; flex-shrink: 0;" />
                <div v-if="i < 3" style="width: 0.5px; min-height: 32px; background: var(--border-default); flex: 1;" />
              </div>
              <div style="padding-bottom: 18px;">
                <UiSkeleton :width="w" height="13px" />
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <div v-else-if="request" class="grid gap-6" style="grid-template-columns: 1fr 320px;">
        <!-- Main column -->
        <div class="flex flex-col gap-5">
          <!-- EUR amount card -->
          <UiCard :padded="false">
            <div style="padding: 28px;">
              <div class="flex justify-between items-start">
                <div>
                  <div class="mb-2 font-mono text-[13px]" style="color: var(--text-muted);">
                    PR-{{ request.id.slice(0, 6).toUpperCase() }} · {{ request.description }}
                  </div>
                  <div
                    class="font-mono font-medium leading-none"
                    style="font-size: 52px; letter-spacing: -0.02em; color: var(--text-primary); font-variant-numeric: tabular-nums;"
                  >{{ formatEur(request.amount_eur) }}</div>
                  <div class="mt-2.5 text-[14px] font-mono" style="color: var(--text-tertiary);">
                    {{ request.currency }} · {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(request.amount_local) }} {{ request.currency }}
                  </div>
                </div>
                <UiBadge :status="request.status" />
              </div>
            </div>
          </UiCard>

          <!-- Conversion details card -->
          <UiCard :padded="false">
            <div style="padding: 8px 24px 16px;">
              <div class="text-[13px] font-medium py-4" style="color: var(--text-tertiary);">{{ t('requests.detail.conversionInfo') }}</div>

              <div
                v-for="(row, i) in [
                  { label: t('requests.detail.originalCurrency'), value: request.currency, mono: false },
                  { label: t('requests.detail.localValue'), value: `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(request.amount_local)} ${request.currency}`, mono: true },
                  { label: t('requests.detail.inEur'), value: formatEur(request.amount_eur), mono: true },
                  { label: t('requests.detail.rateApplied'), value: request.exchange_rate ? String(request.exchange_rate) : '—', mono: true },
                  { label: t('requests.detail.rateSource'), value: request.exchange_rate_source ?? '—', mono: false },
                  { label: t('requests.detail.createdAt'), value: formatDate(request.created_at), mono: false },
                ]"
                :key="i"
                class="flex justify-between items-center py-[13px]"
                :style="{
                  borderBottom: i < 5 ? '0.5px solid var(--border-subtle)' : 'none',
                }"
              >
                <span class="text-[13px]" style="color: var(--text-tertiary);">{{ row.label }}</span>
                <span
                  class="text-[14px]"
                  :style="{
                    color: 'var(--text-primary)',
                    fontFamily: row.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                    fontVariantNumeric: row.mono ? 'tabular-nums' : 'normal',
                  }"
                >{{ row.value }}</span>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- Sidebar — timeline -->
        <UiCard style="height: fit-content;">
          <div class="text-[14px] font-medium mb-5" style="color: var(--text-primary);">{{ t('requests.detail.timeline') }}</div>
          <div class="flex flex-col gap-0">
            <div v-for="(item, i) in timeline" :key="i" class="flex gap-3">
              <div class="flex flex-col items-center">
                <span
                  class="w-3 h-3 rounded-full flex-none mt-[3px]"
                  :style="{
                    background: item.rejected ? 'var(--status-rejected-fg)' : item.expired ? '#71717a' : item.done ? 'var(--status-approved-fg)' : item.current ? 'var(--status-pending-fg)' : 'transparent',
                    border: item.rejected ? '1.5px solid var(--status-rejected-fg)' : item.expired ? '1.5px solid #71717a' : item.current ? '1.5px solid var(--status-pending-fg)' : item.done ? '1.5px solid var(--status-approved-fg)' : '1.5px solid var(--border-default)',
                    boxShadow: item.rejected ? '0 0 7px 2px rgba(239,68,68,0.4)' : item.expired ? '0 0 7px 2px rgba(113,113,122,0.4)' : item.done ? '0 0 7px 2px rgba(34,197,94,0.4)' : item.current ? '0 0 7px 2px rgba(245,158,11,0.4)' : 'none',
                  }"
                />
                <span
                  v-if="i < timeline.length - 1"
                  class="flex-1 min-h-8"
                  style="width: 0.5px; background: var(--border-default);"
                />
              </div>
              <div :class="['pb-[18px]', i === timeline.length - 1 ? 'pb-0' : '']">
                <div
                  class="text-[14px]"
                  :style="{ color: item.done || item.current ? 'var(--text-primary)' : 'var(--text-tertiary)' }"
                >{{ item.label }}</div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
    </main>
    </div>
  </div>
</template>
