<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="emit('cancel')" />
        <div class="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p v-if="description" class="mt-2 text-sm text-gray-500">{{ description }}</p>
          <div class="mt-6 flex gap-3 justify-end">
            <button
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              @click="emit('cancel')"
            >
              {{ cancelText || 'Cancel' }}
            </button>
            <button
              :disabled="loading"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50',
                confirmColor || 'bg-blue-600 hover:bg-blue-700',
              ]"
              @click="emit('confirm')"
            >
              <span v-if="loading" class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
              <span v-else>{{ confirmText || 'Confirm' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
