<script setup lang="ts">
definePageMeta({
  layout: 'wholesaler',
  middleware: 'auth',
})

const { t } = useI18n()
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900">{{ t('nav.users') }}</h2>
    <p class="mt-2 text-gray-500">User management will be implemented in Phase 5.</p>
  </div>
</template>
