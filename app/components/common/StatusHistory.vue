<script setup lang="ts">
import type { StatusChange } from '~/types/order'

defineProps<{
  history: StatusChange[]
}>()

function formatDate(timestamp: { toDate?: () => Date } | Date): string {
  const date = 'toDate' in timestamp && timestamp.toDate ? timestamp.toDate() : timestamp as Date
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400',
  accepted: 'bg-blue-400',
  shipped: 'bg-purple-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-red-400',
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(entry, index) in history"
      :key="index"
      class="flex gap-3 items-start"
    >
      <div class="flex flex-col items-center">
        <div :class="['w-3 h-3 rounded-full mt-1', statusColors[entry.status] || 'bg-gray-400']" />
        <div v-if="index < history.length - 1" class="w-px h-8 bg-gray-200" />
      </div>
      <div class="text-sm">
        <span class="font-medium capitalize">{{ entry.status }}</span>
        <span v-if="entry.note" class="text-gray-500"> — {{ entry.note }}</span>
        <div class="text-gray-400 text-xs">{{ formatDate(entry.changedAt) }}</div>
      </div>
    </div>
  </div>
</template>
