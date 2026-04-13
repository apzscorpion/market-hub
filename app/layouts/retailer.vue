<script setup lang="ts">
const { t } = useI18n()
const { logout } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-gray-900">{{ t('app.name') }}</h1>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/retailer/products" class="text-sm text-gray-600 hover:text-gray-900" active-class="text-blue-600 font-medium">
            {{ t('nav.products') }}
          </NuxtLink>
          <NuxtLink to="/retailer/orders" class="text-sm text-gray-600 hover:text-gray-900" active-class="text-blue-600 font-medium">
            {{ t('nav.orders') }}
          </NuxtLink>
          <CommonCartIcon />
          <button class="text-sm text-gray-400 hover:text-gray-600" @click="logout">
            {{ t('auth.logout') }}
          </button>
        </nav>
      </div>
    </header>
    <main class="max-w-7xl mx-auto p-4">
      <slot />
    </main>
    <CommonToast />
  </div>
</template>
