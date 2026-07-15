<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  disabled?: boolean
  busy?: boolean
}>(), {
  min: 1,
  max: 99,
  disabled: false,
  busy: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function update(value: number) {
  if (props.disabled || props.busy) return
  emit('update:modelValue', Math.min(props.max, Math.max(props.min, value)))
}
</script>

<template>
  <div class="stepper" :aria-disabled="disabled || busy">
    <button
      type="button"
      aria-label="减少数量"
      :disabled="disabled || busy || modelValue <= min"
      @click="update(modelValue - 1)"
    >
      <Minus :size="16" />
    </button>
    <output :aria-label="`数量 ${modelValue}`">{{ modelValue }}</output>
    <button
      type="button"
      aria-label="增加数量"
      :disabled="disabled || busy || modelValue >= max"
      @click="update(modelValue + 1)"
    >
      <Plus :size="16" />
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: grid;
  width: 132px;
  height: 44px;
  grid-template-columns: 44px 44px 44px;
  border: 1px solid #e6e6e6;
}

.stepper button,
.stepper output {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: #ffffff;
}

.stepper button:hover:not(:disabled) {
  background: #f5f5f5;
}

.stepper button:disabled {
  color: #b6b6b6;
}
</style>
