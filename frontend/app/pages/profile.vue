<script setup lang="ts">
import { useProfileController } from '~/composables/useProfileController'
import { useAuthStore } from '~/stores/auth'
import { Camera } from '@lucide/vue'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const {
  profile, loading,
  infoForm, infoSaving, infoErrors, saveInfo,
  passForm, passSaving, passErrors, savePassword,
  showCropModal, cropSrc, avatarUploading,
  openFilePicker, confirmCrop, cancelCrop,
  CURRENCIES,
} = useProfileController()

const nav = computed(() =>
  auth.isFinance
    ? [
        { label: 'Fila de aprovação', to: '/finance' },
        { label: 'Histórico', to: '/finance/history' },
        { label: 'Relatórios', to: '/finance/reports' },
      ]
    : [
        { label: 'Dashboard', to: '/' },
        { label: 'Requisições', to: '/requests/new' },
        { label: 'Histórico', to: '/history' },
      ]
)

const roleLabel = computed(() =>
  profile.value?.role === 'finance' ? 'Finance' : 'Employee'
)
</script>

<template>
  <div>
    <AppTopbar :nav="nav" :user="{ name: auth.user?.name ?? '', role: auth.user?.role }" />

    <main class="px-8 py-8" style="max-width: 680px; margin: 0 auto;">
      <div class="mb-6">
        <h1 class="font-medium mb-1" style="font-size: 22px; color: var(--text-primary);">Perfil</h1>
        <p class="text-sm" style="color: var(--text-tertiary);">Gerencie suas informações e segurança da conta.</p>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="flex flex-col gap-5">
        <UiCard :padded="false">
          <div style="padding: 28px;">
            <div
              class="flex items-center gap-5"
              style="padding-bottom: 24px; border-bottom: 0.5px solid var(--border-subtle); margin-bottom: 28px;"
            >
              <UiSkeleton width="80px" height="80px" rounded="50%" />
              <div>
                <UiSkeleton width="150px" height="16px" />
                <UiSkeleton width="72px" height="22px" rounded="999px" style="margin-top: 8px;" />
              </div>
            </div>
            <div class="flex flex-col gap-5">
              <UiSkeleton width="100%" height="42px" rounded="6px" />
              <UiSkeleton width="100%" height="42px" rounded="6px" />
              <UiSkeleton width="100%" height="42px" rounded="6px" />
            </div>
          </div>
        </UiCard>
        <UiCard :padded="false">
          <div style="padding: 28px;">
            <UiSkeleton width="110px" height="13px" style="margin-bottom: 24px;" />
            <div class="flex flex-col gap-5">
              <UiSkeleton width="100%" height="42px" rounded="6px" />
              <UiSkeleton width="100%" height="42px" rounded="6px" />
              <UiSkeleton width="100%" height="42px" rounded="6px" />
            </div>
          </div>
        </UiCard>
      </div>

      <div v-else class="flex flex-col gap-5">
        <!-- Informações da conta -->
        <UiCard :padded="false">
          <div style="padding: 28px;">
            <!-- Avatar header -->
            <div
              class="flex items-center gap-5"
              style="padding-bottom: 24px; border-bottom: 0.5px solid var(--border-subtle); margin-bottom: 28px;"
            >
              <!-- Clickable avatar with camera overlay -->
              <button
                type="button"
                class="relative flex-none cursor-pointer bg-transparent border-none p-0"
                :disabled="avatarUploading"
                :style="{ opacity: avatarUploading ? 0.5 : 1 }"
                @click="openFilePicker"
                title="Alterar foto"
              >
                <UiAvatar
                  :name="profile?.name ?? ''"
                  :src="profile?.avatar_url ?? undefined"
                  :size="80"
                />
                <span
                  class="absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150"
                  style="background: rgba(0,0,0,0.5);"
                >
                  <Camera :size="20" color="white" />
                </span>
              </button>

              <div>
                <div class="font-medium" style="font-size: 17px; color: var(--text-primary);">
                  {{ profile?.name }}
                </div>
                <span
                  class="inline-block mt-1.5 text-xs font-medium px-[9px] py-[3px] rounded-sm"
                  style="
                    background: var(--bg-input);
                    border: 0.5px solid var(--border-default);
                    color: var(--text-secondary);
                  "
                >{{ roleLabel }}</span>
              </div>
            </div>

            <!-- Form -->
            <div class="flex flex-col gap-5">
              <UiInput
                v-model="infoForm.name"
                label="Nome"
                :hint="infoErrors.name"
              />
              <UiInput
                v-model="infoForm.email"
                label="E-mail"
                type="email"
                :hint="infoErrors.email"
              />
              <UiSelect
                v-model="infoForm.currency"
                label="Moeda padrão"
                :options="CURRENCIES.map(c => ({ value: c.value, label: c.label, flag: c.flag }))"
              />
            </div>

            <div class="flex justify-end mt-6">
              <UiButton variant="primary" size="sm" :loading="infoSaving" @click="saveInfo">
                Salvar alterações
              </UiButton>
            </div>
          </div>
        </UiCard>

        <!-- Alterar senha -->
        <UiCard :padded="false">
          <div style="padding: 28px;">
            <div class="text-[13px] font-medium mb-6" style="color: var(--text-tertiary);">
              Alterar senha
            </div>

            <div class="flex flex-col gap-5">
              <UiInput
                v-model="passForm.current_password"
                label="Senha atual"
                type="password"
                :hint="passErrors.current_password"
              />
              <UiInput
                v-model="passForm.password"
                label="Nova senha"
                type="password"
                :hint="passErrors.password"
              />
              <UiInput
                v-model="passForm.password_confirmation"
                label="Confirmar nova senha"
                type="password"
                :hint="passErrors.password_confirmation"
              />
            </div>

            <div class="flex justify-end mt-6">
              <UiButton variant="primary" size="sm" :loading="passSaving" @click="savePassword">
                Alterar senha
              </UiButton>
            </div>
          </div>
        </UiCard>
      </div>
    </main>

    <!-- Crop modal -->
    <UiAvatarCropModal
      v-if="showCropModal"
      :src="cropSrc"
      @confirm="confirmCrop"
      @cancel="cancelCrop"
    />
  </div>
</template>
