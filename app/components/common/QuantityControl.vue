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

const editing = ref(false)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

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

function startEdit(): void {
  inputValue.value = String(props.quantity)
  editing.value = true
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

function finishEdit(): void {
  editing.value = false
  const num = parseInt(inputValue.value, 10)
  if (!isNaN(num) && num >= props.min && num <= props.max) {
    emit('update:quantity', num)
  }
  else if (!isNaN(num) && num === 0 && props.min === 0) {
    emit('update:quantity', 0)
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    finishEdit()
  }
  else if (e.key === 'Escape') {
    editing.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-0.5">
    <button
      :disabled="quantity <= min"
      class="w-9 h-9 flex items-center justify-center rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="handleDecrement"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>

    <input
      v-if="editing"
      ref="inputRef"
      v-model="inputValue"
      type="number"
      inputmode="numeric"
      pattern="[0-9]*"
      :min="min"
      :max="max"
      class="w-12 h-9 text-center text-sm font-semibold border-y border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
      @blur="finishEdit"
      @keydown="onKeydown"
    >
    <button
      v-else
      class="w-12 h-9 text-center text-sm font-semibold border-y border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-text transition-colors"
      @click="startEdit"
    >
      {{ quantity }}
    </button>

    <button
      :disabled="quantity >= max"
      class="w-9 h-9 flex items-center justify-center rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="handleIncrement"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>
</template>
