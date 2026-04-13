<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-gray-900">{{ t('app.name') }}</h1>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/delivery/orders" class="text-sm text-gray-600 hover:text-gray-900">
            {{ t('nav.orders') }}
          </NuxtLink>
          <NuxtLink to="/delivery/history" class="text-sm text-gray-600 hover:text-gray-900">
            {{ t('nav.history') }}
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="p-4">
      <slot />
    </main>
  </div>
</template>
