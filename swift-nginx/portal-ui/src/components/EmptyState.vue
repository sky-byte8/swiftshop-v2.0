<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <section class="empty-state">
    <div v-if="$slots.icon" class="empty-state__icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <button v-if="actionLabel" class="btn btn--primary" type="button" @click="emit('action')">
      {{ actionLabel }}
    </button>
  </section>
</template>

<style scoped>
.empty-state {
  display: grid;
  min-height: 320px;
  place-items: center;
  align-content: center;
  gap: 16px;
  padding: 64px 24px;
  text-align: center;
}

.empty-state__icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  color: #727272;
}

.empty-state__description {
  max-width: 480px;
  color: #727272;
}
</style>
