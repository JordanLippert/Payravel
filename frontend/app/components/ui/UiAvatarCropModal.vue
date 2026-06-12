<script setup lang="ts">
import { ref } from 'vue'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'

const props = defineProps<{ src: string }>()
const emit = defineEmits<{ confirm: [blob: Blob]; cancel: [] }>()

const cropperRef = ref()

function confirm() {
  const { canvas } = cropperRef.value.getResult()
  canvas.toBlob(
    (blob: Blob | null) => { if (blob) emit('confirm', blob) },
    'image/webp',
    0.92,
  )
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0"
        style="background: rgba(0,0,0,0.65);"
        @click="emit('cancel')"
      />

      <div
        class="relative flex flex-col rounded-xl"
        style="
          background: var(--bg-elevated);
          border: 0.5px solid var(--border-subtle);
          box-shadow: var(--shadow-menu);
          width: 460px;
          padding: 28px;
        "
      >
        <div class="font-medium mb-5" style="font-size: 16px; color: var(--text-primary);">
          Ajustar foto de perfil
        </div>

        <div style="height: 340px; border-radius: 8px; overflow: hidden; background: #111;">
          <ClientOnly>
            <Cropper
              ref="cropperRef"
              :src="src"
              :stencil-component="CircleStencil"
              :stencil-props="{ movable: true, resizable: true, aspectRatio: 1 }"
              :transitions="true"
              image-restriction="stencil"
              style="height: 340px;"
            />
          </ClientOnly>
        </div>

        <p class="text-xs mt-3" style="color: var(--text-muted);">
          Arraste para reposicionar · Scroll para ajustar o zoom
        </p>

        <div class="flex justify-end gap-3 mt-5">
          <UiButton variant="ghost" size="sm" @click="emit('cancel')">Cancelar</UiButton>
          <UiButton variant="primary" size="sm" @click="confirm">Confirmar foto</UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.vue-advanced-cropper__background,
.vue-advanced-cropper__image-wrapper {
  background: #111 !important;
}
</style>
