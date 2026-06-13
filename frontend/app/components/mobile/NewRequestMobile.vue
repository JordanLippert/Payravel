<!-- app/components/mobile/NewRequestMobile.vue -->
<script setup lang="ts">
import { ChevronLeft, ChevronRight, Send, RefreshCw, Zap } from '@lucide/vue'
import { useNewRequestController } from '~/composables/useNewRequestController'

const router = useRouter()
const {
  step, loading, rateLoading, advancing, fetchFailed,
  description, amountDisplay, onAmountKey, currency, rate, rateSource,
  amountEur, errors, CURRENCIES,
  advance, confirm, retryFetch, submit,
} = useNewRequestController()

const stepTitles = ['Detalhes', 'Câmbio', 'Revisão']

const selectedCurrency = computed(() => CURRENCIES.find(c => c.value === currency.value) ?? CURRENCIES[0])

const showCurrencySheet = ref(false)

function pickCurrency(val: string) {
  currency.value = val
  showCurrencySheet.value = false
}

function handleBack() {
  if (step.value === 1) router.back()
  else step.value--
}

const fmtEUR = (n: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
</script>

<template>
  <div class="flex flex-col" style="min-height: 100dvh;">

    <!-- Sticky top bar with progress -->
    <div style="position: sticky; top: 0; z-index: 10; background: var(--bg-base); padding: 6px 16px 14px; border-bottom: 0.5px solid var(--border-subtle);">
      <div class="flex items-center" style="gap: 8px; height: 40px;">
        <button
          type="button"
          style="background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex: none;"
          @click="handleBack"
        >
          <ChevronLeft :size="18" style="color: var(--text-primary);" />
        </button>
        <span style="font-size: 15px; font-weight: 500; color: var(--text-primary);">{{ stepTitles[step - 1] }}</span>
        <span style="margin-left: auto; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">{{ step }}/3</span>
      </div>
      <!-- Progress bar -->
      <div class="flex" style="gap: 5px; margin-top: 11px;">
        <span
          v-for="i in 3"
          :key="i"
          style="flex: 1; height: 2.5px; border-radius: 999px; transition: background 200ms ease;"
          :style="{ background: i <= step ? 'var(--red-500)' : 'var(--border-default)' }"
        />
      </div>
    </div>

    <!-- Step content -->
    <div class="flex-1" style="padding: 16px 16px 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">

      <!-- Step 1: Details -->
      <template v-if="step === 1">
        <div>
          <div style="font-size: 17px; font-weight: 500; color: var(--text-primary);">Detalhes</div>
          <div style="font-size: 12.5px; color: var(--text-tertiary); margin-top: 2px;">O que você precisa reembolsar?</div>
        </div>
        <UiInput label="Descrição" v-model="description" placeholder="Ex: Licença Figma" :hint="errors.description" />
        <div>
          <div style="font-size: 11.5px; font-weight: 500; color: var(--text-tertiary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">Valor</div>
          <div style="display: flex; align-items: center; gap: 10px; height: 54px; padding: 0 14px; background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 12px;">
            <span style="font-family: var(--font-mono); font-size: 16px; color: var(--text-muted);">{{ currency }}</span>
            <input
              :value="amountDisplay"
              @keydown="onAmountKey"
              inputmode="decimal"
              style="flex: 1; min-width: 0; background: none; border: none; outline: none; text-align: right; font-family: var(--font-mono); font-size: 24px; font-weight: 500; color: var(--text-primary); font-variant-numeric: tabular-nums;"
              placeholder="0,00"
            />
          </div>
          <div v-if="errors.amount" style="font-size: 11.5px; color: var(--status-rejected-fg); margin-top: 4px;">{{ errors.amount }}</div>
        </div>
        <!-- Currency picker -->
        <div>
          <div style="font-size: 11.5px; font-weight: 500; color: var(--text-tertiary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">Moeda</div>
          <button
            type="button"
            style="width: 100%; display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 13px; background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 12px; cursor: pointer; font-family: var(--font-sans);"
            @click="showCurrencySheet = !showCurrencySheet"
          >
            <span style="font-size: 20px;">{{ selectedCurrency.flag }}</span>
            <span style="font-size: 14px; color: var(--text-primary);">{{ selectedCurrency.label }}</span>
            <span style="margin-left: auto; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">{{ selectedCurrency.meta ?? selectedCurrency.value }}</span>
            <ChevronRight :size="16" style="color: var(--text-muted);" />
          </button>
          <!-- Currency sheet dropdown -->
          <div v-if="showCurrencySheet" style="margin-top: 6px; background: var(--bg-elevated); border: 0.5px solid var(--border-default); border-radius: 12px; overflow: hidden;">
            <button
              v-for="c in CURRENCIES"
              :key="c.value"
              type="button"
              style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 13px; cursor: pointer; border: none; border-bottom: 0.5px solid var(--border-subtle); font-family: var(--font-sans); transition: background 100ms;"
              :style="{ background: c.value === currency ? 'var(--bg-input)' : 'transparent' }"
              @click="pickCurrency(c.value)"
            >
              <span style="font-size: 18px;">{{ c.flag }}</span>
              <span style="font-size: 13.5px; color: var(--text-primary);">{{ c.label }}</span>
              <span style="margin-left: auto; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">{{ c.meta ?? c.value }}</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Step 2: Exchange rate -->
      <template v-if="step === 2">
        <div>
          <div style="font-size: 17px; font-weight: 500; color: var(--text-primary);">Câmbio</div>
          <div style="font-size: 12.5px; color: var(--text-tertiary); margin-top: 2px;">Taxa buscada automaticamente.</div>
        </div>
        <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 14px;">
          <div class="flex items-center justify-between">
            <span style="font-size: 12.5px; color: var(--text-tertiary);">Taxa de câmbio</span>
            <span
              style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; background: var(--status-approved-bg); color: var(--status-approved-fg); border: 0.5px solid var(--status-approved-border); border-radius: 999px; padding: 3px 8px;"
            >
              <Zap :size="11" style="color: var(--status-approved-fg);" :fill="'var(--status-approved-fg)'" />ao vivo
            </span>
          </div>
          <div v-if="rateLoading" style="margin-top: 4px;"><UiSkeleton width="180px" height="32px" rounded="6px" /></div>
          <div v-else style="font-family: var(--font-mono); font-size: 26px; font-weight: 500; color: var(--text-primary); font-variant-numeric: tabular-nums;">
            1 {{ currency }} = {{ rate }} EUR
          </div>
          <div style="height: 0.5px; background: var(--border-subtle);" />
          <div class="flex items-center justify-between">
            <div>
              <div style="font-size: 11.5px; color: var(--text-muted);">Você envia</div>
              <div style="font-family: var(--font-mono); font-size: 15px; color: var(--text-secondary); margin-top: 2px;">{{ currency }} {{ amountDisplay }}</div>
            </div>
            <ChevronRight :size="16" style="color: var(--text-muted);" />
            <div class="text-right">
              <div style="font-size: 11.5px; color: var(--text-muted);">Equivale a</div>
              <div style="font-family: var(--font-mono); font-size: 17px; font-weight: 500; color: var(--red-500); margin-top: 2px;">€ {{ amountEur ? fmtEUR(amountEur) : '0,00' }}</div>
            </div>
          </div>
        </div>
        <div v-if="fetchFailed" style="display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--status-rejected-fg);">
          Taxa indisponível.
          <button type="button" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); text-decoration: underline; font-size: 12px;" @click="retryFetch">
            <RefreshCw :size="12" class="inline mr-1" />Tentar novamente
          </button>
        </div>
        <div v-else style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--text-muted);">
          <RefreshCw :size="13" />Fonte: {{ rateSource }} · ao vivo
        </div>
      </template>

      <!-- Step 3: Review -->
      <template v-if="step === 3">
        <div>
          <div style="font-size: 17px; font-weight: 500; color: var(--text-primary);">Revisão</div>
          <div style="font-size: 12.5px; color: var(--text-tertiary); margin-top: 2px;">Confirme antes de enviar.</div>
        </div>
        <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 16px; padding: 18px; text-align: center;">
          <div style="font-size: 12px; color: var(--text-muted);">Equivalente em EUR</div>
          <div style="font-family: var(--font-mono); font-size: 38px; font-weight: 500; letter-spacing: -0.02em; color: var(--text-primary); margin-top: 6px; font-variant-numeric: tabular-nums;">€ {{ amountEur ? fmtEUR(amountEur) : '0,00' }}</div>
          <div style="font-size: 12.5px; color: var(--text-tertiary); margin-top: 4px;">{{ currency }} {{ amountDisplay }} · taxa {{ rate }}</div>
        </div>
        <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 16px; overflow: hidden;">
          <div
            v-for="([k, v], i) in [['Descrição', description], ['Moeda', currency], ['Valor local', `${currency} ${amountDisplay}`], ['Fonte da taxa', rateSource]]"
            :key="k"
            style="display: flex; justify-content: space-between; gap: 12px; padding: 12px 15px;"
            :style="{ borderBottom: i < 3 ? '0.5px solid var(--border-subtle)' : 'none' }"
          >
            <span style="font-size: 13px; color: var(--text-tertiary);">{{ k }}</span>
            <span style="font-size: 13px; color: var(--text-primary); font-weight: 500; text-align: right;">{{ v }}</span>
          </div>
        </div>
      </template>

    </div>

    <!-- Sticky footer actions -->
    <div style="position: sticky; bottom: 0; background: var(--bg-base); border-top: 0.5px solid var(--border-subtle); padding: 12px 16px 28px; display: flex; flex-direction: column; gap: 9px;">
      <div
        v-if="advancing && rateLoading"
        class="flex items-center gap-2 text-xs font-sans"
        style="color: var(--text-muted);"
      >
        <span class="pulse-dot" />
        Buscando taxa de câmbio...
      </div>
      <div style="display: flex; gap: 9px;">
        <UiButton variant="ghost" size="lg" @click="handleBack">
          {{ step === 1 ? 'Cancelar' : 'Voltar' }}
        </UiButton>
        <UiButton
          variant="primary"
          size="lg"
          class="flex-1"
          :loading="advancing || loading"
          @click="step === 3 ? submit() : step === 2 ? confirm() : advance()"
        >
          <template v-if="step === 3">
            Enviar <Send :size="15" class="ml-1.5" />
          </template>
          <template v-else>
            Continuar <ChevronRight :size="16" class="ml-1" />
          </template>
        </UiButton>
      </div>
    </div>

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
