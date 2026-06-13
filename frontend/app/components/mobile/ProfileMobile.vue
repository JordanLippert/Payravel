<!-- app/components/mobile/ProfileMobile.vue -->
<script setup lang="ts">
import { ChevronRight, LogOut } from '@lucide/vue'
import { useProfileController } from '~/composables/useProfileController'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const {
  profile, loading,
  infoForm, infoSaving, infoErrors, saveInfo,
  showCropModal, cropSrc, avatarUploading,
  openFilePicker, confirmCrop, cancelCrop,
} = useProfileController()

const roleLabel = computed(() => profile.value?.role === 'finance' ? 'Finance' : 'Employee')

async function logout() {
  try { await auth.logout() } catch { /* already invalid */ }
  auth.token = null
  auth.user = null
  router.push('/login')
}

const showPasswordSection = ref(false)
</script>

<template>
  <div style="padding: 8px 16px 96px; display: flex; flex-direction: column; gap: 20px;">

    <div style="font-size: 17px; font-weight: 500; color: var(--text-primary);">Perfil</div>

    <!-- Avatar block -->
    <div
      style="
        display: flex; flex-direction: column; align-items: center; gap: 11px;
        padding-bottom: 20px; border-bottom: 0.5px solid var(--border-subtle);
      "
    >
      <button
        type="button"
        class="relative cursor-pointer bg-transparent border-none p-0"
        :disabled="avatarUploading"
        :style="{ opacity: avatarUploading ? 0.5 : 1 }"
        @click="openFilePicker"
      >
        <UiAvatar
          :name="profile?.name ?? ''"
          :src="profile?.avatar_url ?? undefined"
          :size="68"
        />
        <span
          style="position: absolute; bottom: 0; right: 0; width: 22px; height: 22px; border-radius: 999px; background: var(--bg-elevated); border: 1.5px solid var(--border-strong); display: flex; align-items: center; justify-content: center;"
        >
          <span style="font-size: 11px;">✏</span>
        </span>
      </button>
      <div style="text-align: center;">
        <div style="font-size: 15px; font-weight: 500; color: var(--text-primary);">{{ profile?.name }}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">{{ profile?.email }}</div>
      </div>
      <span style="background: var(--bg-input); border: 0.5px solid var(--border-default); border-radius: 999px; padding: 3px 11px; font-size: 10.5px; color: var(--text-secondary);">
        {{ roleLabel }}
      </span>
    </div>

    <!-- Info section -->
    <div>
      <div style="font-size: 12.5px; font-weight: 500; color: var(--text-primary); margin-bottom: 10px;">Informações</div>
      <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 14px; overflow: hidden;">
        <div style="padding: 13px 15px; border-bottom: 0.5px solid var(--border-subtle);">
          <div style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 4px;">Nome</div>
          <UiInput v-model="infoForm.name" :hint="infoErrors.name" style="margin: 0;" />
        </div>
        <div style="padding: 13px 15px; border-bottom: 0.5px solid var(--border-subtle);">
          <div style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 4px;">E-mail</div>
          <UiInput v-model="infoForm.email" type="email" :hint="infoErrors.email" style="margin: 0;" />
        </div>
      </div>
      <div class="flex justify-end" style="margin-top: 10px;">
        <UiButton variant="primary" size="sm" :loading="infoSaving" @click="saveInfo">
          Salvar
        </UiButton>
      </div>
    </div>

    <!-- Account section -->
    <div>
      <div style="font-size: 12.5px; font-weight: 500; color: var(--text-primary); margin-bottom: 10px;">Conta</div>
      <div style="background: var(--surface-card, var(--bg-elevated)); border: 0.5px solid var(--border-subtle); border-radius: 14px; overflow: hidden;">
        <button
          type="button"
          class="w-full flex items-center justify-between"
          style="padding: 14px 15px; background: transparent; border: none; border-bottom: 0.5px solid var(--border-subtle); cursor: pointer;"
          @click="showPasswordSection = !showPasswordSection"
        >
          <span style="font-size: 13.5px; color: var(--text-primary);">Alterar senha</span>
          <ChevronRight :size="15" style="color: var(--text-muted);" />
        </button>
        <button
          type="button"
          class="w-full flex items-center justify-between"
          style="padding: 14px 15px; background: transparent; border: none; cursor: pointer;"
          @click="logout"
        >
          <span style="font-size: 13.5px; color: var(--status-rejected-fg);">Sair</span>
          <LogOut :size="15" style="color: var(--status-rejected-fg);" />
        </button>
      </div>
    </div>

  </div>

  <!-- Crop modal (shared with desktop) -->
  <UiAvatarCropModal
    v-if="showCropModal"
    :src="cropSrc"
    @confirm="confirmCrop"
    @cancel="cancelCrop"
  />
</template>
