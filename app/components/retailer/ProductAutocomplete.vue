<script setup lang="ts">
import type { Product } from '~/types/product'
import type { MatchResult } from '~/utils/productMatcher'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [product: Product]
}>()

const { search } = useProductSearch()

const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const highlightedIndex = ref(0)
const results = ref<MatchResult[]>([])

const inputValue = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

function onInput(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  inputValue.value = value

  if (value.trim().length === 0) {
    results.value = []
    isOpen.value = false
    return
  }

  results.value = search(value)
  isOpen.value = results.value.length > 0
  highlightedIndex.value = 0
}

function selectItem(match: MatchResult): void {
  inputValue.value = match.product.nickname || match.product.name
  emit('select', match.product)
  isOpen.value = false
  results.value = []
}

function onKeydown(e: KeyboardEvent): void {
  if (!isOpen.value) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, results.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (results.value[highlightedIndex.value]) {
        selectItem(results.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      isOpen.value = false
      break
    case 'Tab':
      if (results.value[highlightedIndex.value]) {
        selectItem(results.value[highlightedIndex.value])
      }
      break
  }
}

function onBlur(): void {
  setTimeout(() => { isOpen.value = false }, 150)
}

function focus(): void {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="relative">
    <input
      ref="inputRef"
      :value="inputValue"
      type="text"
      :disabled="disabled"
      placeholder="Type product name..."
      class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
      autocomplete="off"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      @focus="inputValue && onInput({ target: { value: inputValue } } as any)"
    >

    <div
      v-if="isOpen && results.length > 0"
      class="absolute z-50 mt-1 w-full min-w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <button
        v-for="(match, idx) in results"
        :key="match.product.id"
        type="button"
        :class="[
          'w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0',
          idx === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50',
        ]"
        @mousedown.prevent="selectItem(match)"
        @mouseenter="highlightedIndex = idx"
      >
        <div class="flex items-center justify-between">
          <div>
            <span class="font-medium text-gray-900">{{ match.product.nickname }}</span>
            <span v-if="match.product.nickname !== match.product.name" class="text-gray-400 text-xs ml-1">
              {{ match.product.name }}
            </span>
          </div>
        </div>
        <div class="text-xs text-gray-500 mt-0.5">
          {{ formatPrice(match.product.price) }} / {{ match.product.unitType }}
          <span v-if="match.matchedField === 'alias'" class="text-blue-500 ml-1">
            ({{ match.matchedValue }})
          </span>
        </div>
      </button>
    </div>

    <div
      v-if="isOpen && results.length === 0 && inputValue.trim().length > 0"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3"
    >
      <p class="text-sm text-gray-500">No products found</p>
    </div>
  </div>
</template>
