<script setup lang="ts">
definePageMeta({
  layout: 'delivery',
  middleware: 'auth',
})

const { t } = useI18n()
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900">{{ t('nav.history') }}</h2>
    <p class="mt-2 text-gray-500">Delivery history will be implemented in Phase 6.</p>
  </div>
</template>
