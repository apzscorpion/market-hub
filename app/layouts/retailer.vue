<script setup lang="ts">
const { t } = useI18n()
const { logout } = useAuth()
const route = useRoute()
const cartStore = useCartStore()

const tabs = [
  { to: '/retailer/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/retailer/order', label: 'New Order', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { to: '/retailer/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/retailer/cart', label: 'Cart', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
]

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- Top header — slim, mobile-friendly -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="px-4 py-2.5 flex items-center justify-between">
        <h1 class="text-base font-semibold text-gray-900 truncate">{{ t('app.name') }}</h1>
        <button class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1" @click="logout">
          {{ t('auth.logout') }}
        </button>
      </div>
    </header>

    <!-- Page content -->
    <main class="px-3 py-3 sm:px-4 sm:py-4 max-w-3xl mx-auto">
      <slot />
    </main>

    <!-- Bottom tab bar — fixed -->
    <nav class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 safe-bottom">
      <div class="flex items-stretch">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          :class="[
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition-colors relative',
            isActive(tab.to) ? 'text-blue-600 font-semibold' : 'text-gray-400',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
          </svg>
          <span>{{ tab.label }}</span>
          <!-- Cart badge -->
          <span
            v-if="tab.to === '/retailer/cart' && cartStore.itemCount > 0"
            class="absolute top-1 right-1/4 bg-blue-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none"
          >
            {{ cartStore.itemCount > 9 ? '9+' : cartStore.itemCount }}
          </span>
        </NuxtLink>
      </div>
    </nav>

    <CommonToast />
  </div>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
