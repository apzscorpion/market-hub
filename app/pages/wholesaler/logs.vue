<script setup lang="ts">
import type { ActivityLogEntry } from '~/composables/useActivityLog'

definePageMeta({ layout: 'wholesaler', middleware: 'auth' })

const { fetchLogs } = useActivityLog()
const logs = ref<ActivityLogEntry[]>([])
const loading = ref(true)

onMounted(async () => {
  logs.value = await fetchLogs(100)
  loading.value = false
})

function actionColor(action: string): string {
  if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-700'
  if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-700'
  if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-700'
  if (action.includes('status')) return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold text-gray-900">Activity Logs</h2>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 6" :key="i" class="bg-white border rounded-lg p-4 animate-pulse">
        <div class="h-3 bg-gray-200 rounded w-1/4 mb-2" />
        <div class="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>

    <div v-else-if="logs.length === 0" class="text-center py-12 text-gray-500">
      No activity logs yet. Actions will appear here as the system is used.
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="entry in logs"
        :key="entry.id"
        class="bg-white border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="['text-[10px] px-1.5 py-0.5 rounded font-medium', actionColor(entry.action)]">
                {{ entry.action }}
              </span>
              <span class="text-sm text-gray-900">{{ entry.details }}</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              {{ entry.entity }} &middot; by {{ entry.userName }}
            </p>
          </div>
          <span class="text-xs text-gray-400 whitespace-nowrap">
            {{ formatDate(entry.createdAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
