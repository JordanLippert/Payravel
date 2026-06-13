<script setup lang="ts">
import { useNewRequestController } from '~/composables/useNewRequestController'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const isMobile = useIsMobile()

const {
  step, loading, rateLoading, advancing, fetchFailed,
  description, amountDisplay, onAmountKey, currency, rate, rateSource, rateValidFor,
  amountEur, errors, CURRENCIES,
  advance, confirm, retryFetch, submit,
} = useNewRequestController()

const auth = useAuthStore()

const nav = computed(() => [
  { label: 'Dashboard', to: '/' },
  { label: 'Requisições', to: '/requests/new', active: true },
  { label: 'Histórico', to: '/history' },
])

const steps = [
  { title: 'Detalhes', desc: 'Descrição e valor' },
  { title: 'Câmbio', desc: 'Taxa ao vivo' },
  { title: 'Revisão', desc: 'Confirmar e enviar' },
]

const stepperCurrent = computed(() => step.value - 1)

const fmtEUR = (n: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
</script>

<template>
  <NewRequestMobile v-if="isMobile" />
  <div v-else>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '' }" />

    <main class="px-8 py-8" style="max-width: 1000px; margin: 0 auto;">
      <h1 class="font-medium mb-6" style="font-size: 22px; color: var(--text-primary);">Nova requisição de pagamento</h1>

      <div class="flex flex-col lg:grid gap-6 lg:gap-[40px]" style="grid-template-columns: 220px 1fr;">
        <!-- Stepper sidebar -->
        <div class="hidden lg:block" style="padding-top: 8px;">
          <UiStepper :steps="steps" :current="stepperCurrent" />
        </div>

        <!-- Form card -->
        <UiCard :padded="false" :overflow="false">
          <div class="flex flex-col" style="padding: 28px; gap: 18px;">

            <!-- Step 1: Detalhes -->
            <template v-if="step === 1">
              <UiInput
                label="Descrição"
                v-model="description"
                placeholder="Ex. Licença de software"
                :hint="errors.description"
              />

              <div class="grid grid-cols-2" style="gap: 14px;">
                <UiInput
                  label="Valor"
                  :model-value="amountDisplay"
                  placeholder="0,00"
                  :mono="true"
                  :hint="errors.amount"
                  @keydown="onAmountKey"
                />
                <UiSelect
                  label="Moeda"
                  v-model="currency"
                  :options="CURRENCIES"
                  placeholder="Selecionar"
                  :hint="errors.currency"
                />
              </div>

              <div class="flex items-center justify-between" style="gap: 10px; margin-top: 8px;">
                <div
                  v-if="advancing && rateLoading"
                  class="flex items-center gap-2 text-xs font-sans"
                  style="color: var(--text-muted);"
                >
                  <span class="pulse-dot" />
                  Buscando taxa de câmbio...
                </div>
                <div
                  v-else-if="fetchFailed"
                  class="flex items-center gap-2 text-xs font-sans"
                  style="color: var(--text-muted);"
                >
                  Não foi possível obter a taxa.
                  <button
                    type="button"
                    class="underline bg-transparent border-none p-0 cursor-pointer text-xs font-sans"
                    style="color: var(--text-secondary);"
                    @click="retryFetch"
                  >Tentar novamente</button>
                </div>
                <div v-else />

                <div class="flex" style="gap: 10px;">
                  <UiButton type="button" variant="ghost" @click="$router.push('/')">Cancelar</UiButton>
                  <UiButton type="button" variant="primary" :loading="advancing" @click="advance">
                    Ver câmbio
                  </UiButton>
                </div>
              </div>
            </template>

            <!-- Step 2: Câmbio + confirmação -->
            <template v-else-if="step === 2">
              <!-- Resumo step 1 (readonly) -->
              <div class="grid grid-cols-2" style="gap: 14px;">
                <UiInput label="Valor" :model-value="amountDisplay" :mono="true" :readonly="true" />
                <UiInput label="Moeda" :model-value="currency" :readonly="true" />
              </div>

              <div style="height: 0.5px; background: var(--border-subtle);" />

              <!-- Taxa de câmbio -->
              <div class="grid grid-cols-2" style="gap: 14px;">
                <UiInput
                  label="Taxa de câmbio"
                  :model-value="rate ? String(rate.toFixed(4)) : '—'"
                  :mono="true"
                  :readonly="true"
                >
                  <template #suffix>
                    <span
                      class="inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-full"
                      style="background: var(--status-approved-bg); color: var(--status-approved-fg); border: 0.5px solid var(--status-approved-border); white-space: nowrap; box-shadow: 0 0 8px 1px rgba(34,197,94,0.25);"
                    >
                      <span class="w-1.5 h-1.5 rounded-full flex-none" style="background: var(--status-approved-fg);"></span>
                      ao vivo ✓
                    </span>
                  </template>
                </UiInput>

                <UiInput
                  label="Equivalente em EUR"
                  :model-value="amountEur ? `€ ${fmtEUR(amountEur)}` : '€ 0,00'"
                  :mono="true"
                  :readonly="true"
                  hint="Calculado automaticamente"
                  :hint-muted="true"
                />
              </div>

              <!-- Info bar -->
              <div
                class="flex items-center gap-2 rounded-sm px-3 py-2 text-xs"
                style="background: var(--bg-elevated); border: 0.5px solid var(--border-subtle); color: var(--text-muted);"
              >
                <span class="w-1.5 h-1.5 rounded-full flex-none" style="background: var(--status-approved-fg); box-shadow: 0 0 6px 2px rgba(34,197,94,0.4);"></span>
                <span>Taxa ao vivo · atualiza a cada 30 min</span>
                <template v-if="rateValidFor !== null">
                  <span style="color: var(--border-default);">·</span>
                  <span :style="{ color: rateValidFor <= 5 ? 'var(--status-rejected-fg)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }">
                    válida por ~{{ rateValidFor }} min
                  </span>
                </template>
              </div>

              <div class="flex justify-end" style="gap: 10px; margin-top: 8px;">
                <UiButton type="button" variant="ghost" @click="step = 1">Voltar</UiButton>
                <UiButton type="button" variant="primary" @click="confirm">
                  Revisar pedido
                </UiButton>
              </div>
            </template>

            <!-- Step 3: Revisão -->
            <template v-else-if="step === 3">
              <div>
                <div
                  v-for="(row, i) in [
                    { label: 'Descrição', value: description, mono: false },
                    { label: 'Valor', value: `${amountDisplay} ${currency}`, mono: true },
                    { label: 'Taxa aplicada', value: rate ? rate.toFixed(4) : '—', mono: true, badge: true },
                    { label: 'Fonte da taxa', value: rateSource ?? '—', mono: false },
                    { label: 'Equivalente em EUR', value: amountEur ? `€ ${fmtEUR(amountEur)}` : '€ 0,00', mono: true },
                  ]"
                  :key="i"
                  class="flex justify-between items-center py-[13px]"
                  :style="{ borderBottom: i < 4 ? '0.5px solid var(--border-subtle)' : 'none' }"
                >
                  <span class="text-[13px]" style="color: var(--text-tertiary);">{{ row.label }}</span>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[14px]"
                      :style="{
                        color: 'var(--text-primary)',
                        fontFamily: row.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                        fontVariantNumeric: row.mono ? 'tabular-nums' : 'normal',
                      }"
                    >{{ row.value }}</span>
                    <span
                      v-if="row.badge"
                      class="inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-full"
                      style="background: var(--status-approved-bg); color: var(--status-approved-fg); border: 0.5px solid var(--status-approved-border); white-space: nowrap; box-shadow: 0 0 8px 1px rgba(34,197,94,0.25);"
                    >
                      <span class="w-1.5 h-1.5 rounded-full flex-none" style="background: var(--status-approved-fg);"></span>
                      ao vivo ✓
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex justify-end" style="gap: 10px; margin-top: 8px;">
                <UiButton type="button" variant="ghost" :disabled="loading" @click="step = 2">Voltar</UiButton>
                <UiButton type="button" variant="primary" :loading="loading" @click="submit">
                  Enviar para aprovação
                </UiButton>
              </div>
            </template>

          </div>
        </UiCard>
      </div>
    </main>
  </div>
</template>

<style scoped>
.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-approved-fg);
  flex-shrink: 0;
  animation: pulse-ring 1.4s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.5), 0 0 6px 2px rgba(34,197,94,0.35); }
  50%       { opacity: 0.7; box-shadow: 0 0 0 5px rgba(34,197,94,0), 0 0 6px 2px rgba(34,197,94,0.15); }
}
</style>
