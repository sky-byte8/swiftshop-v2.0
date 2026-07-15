<script setup lang="ts">
import { CheckCircle2, Info, X, XCircle } from 'lucide-vue-next'

import { useNotice } from '@/composables/useNotice'

const { notices, dismiss } = useNotice()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast">
        <div v-for="notice in notices" :key="notice.id" class="toast" :class="`toast--${notice.tone}`">
          <CheckCircle2 v-if="notice.tone === 'success'" :size="18" aria-hidden="true" />
          <XCircle v-else-if="notice.tone === 'error'" :size="18" aria-hidden="true" />
          <Info v-else :size="18" aria-hidden="true" />
          <span>{{ notice.message }}</span>
          <button class="toast__close" type="button" aria-label="关闭提示" @click="dismiss(notice.id)">
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  z-index: 1200;
  top: 24px;
  right: 24px;
  display: grid;
  width: min(380px, calc(100vw - 32px));
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: grid;
  grid-template-columns: 20px 1fr 28px;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 12px 12px 12px 16px;
  border: 1px solid #222222;
  color: #ffffff;
  background: #222222;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  pointer-events: auto;
}

.toast--error {
  border-color: #e71d34;
  background: #b71428;
}

.toast--success {
  border-color: #18794e;
  background: #12613e;
}

.toast__close {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 767px) {
  .toast-stack {
    top: 16px;
    right: 16px;
  }
}
</style>
