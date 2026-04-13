<script setup lang="ts">
const props = withDefaults(defineProps<{
  quantity: number
  min?: number
  max?: number
}>(), {
  min: 1,
  max: 999,
})

const emit = defineEmits<{
  'update:quantity': [value: number]
  increment: []
  decrement: []
}>()

function handleDecrement(): void {
  if (props.quantity > props.min) {
    emit('update:quantity', props.quantity - 1)
    emit('decrement')
  }
}

function handleIncrement(): void {
  if (props.quantity < props.max) {
    emit('update:quantity', props.quantity + 1)
    emit('increment')
  }
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      :disabled="quantity <= min"
      class="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="handleDecrement"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>
    <span class="w-8 text-center text-sm font-medium">{{ quantity }}</span>
    <button
      :disabled="quantity >= max"
      class="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="handleIncrement"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>
</template>
