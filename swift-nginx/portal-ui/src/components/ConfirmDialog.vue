<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="dialog-backdrop" role="presentation" @click.self="emit('cancel')">
        <section class="dialog" role="dialog" aria-modal="true" :aria-labelledby="`${title}-dialog-title`">
          <button class="icon-btn dialog__close" type="button" aria-label="关闭" @click="emit('cancel')">
            <X :size="20" />
          </button>
          <h2 :id="`${title}-dialog-title`" class="section-title">{{ title }}</h2>
          <p class="dialog__message">{{ message }}</p>
          <div class="dialog__actions">
            <button class="btn btn--secondary" type="button" :disabled="busy" @click="emit('cancel')">取消</button>
            <button class="btn btn--primary" type="button" :disabled="busy" @click="emit('confirm')">
              {{ busy ? '处理中...' : (confirmLabel || '确认') }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  z-index: 1100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.48);
}

.dialog {
  position: relative;
  width: min(100%, 440px);
  padding: 32px;
  border-radius: 2px;
  background: #ffffff;
}

.dialog__close {
  position: absolute;
  top: 8px;
  right: 8px;
}

.dialog__message {
  margin-top: 16px;
  color: #727272;
}

.dialog__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 32px;
}

@media (max-width: 480px) {
  .dialog {
    padding: 24px;
  }
}
</style>
