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
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50 pb-20">
    <!-- Top header -->
    <header class="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
      <div class="px-4 py-3 flex items-center justify-between max-w-3xl mx-auto">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 class="text-base font-bold text-gray-900 tracking-tight">{{ t('app.name') }}</h1>
        </div>
        <button
          class="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200"
          @click="logout"
        >
          {{ t('auth.logout') }}
        </button>
      </div>
    </header>

    <!-- Page content with transition -->
    <main class="px-3 py-4 sm:px-4 max-w-3xl mx-auto">
      <slot />
    </main>

    <!-- Bottom tab bar -->
    <nav class="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/60 z-40 safe-bottom">
      <div class="flex items-stretch max-w-3xl mx-auto">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          :class="[
            'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] transition-all duration-200 relative',
            isActive(tab.to)
              ? 'text-blue-600 font-bold'
              : 'text-gray-400 hover:text-gray-600',
          ]"
        >
          <!-- Active indicator dot -->
          <div
            v-if="isActive(tab.to)"
            class="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-600 rounded-full"
          />
          <svg class="w-5 h-5 transition-transform duration-200" :class="isActive(tab.to) && 'scale-110'" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
          </svg>
          <span>{{ tab.label }}</span>
          <!-- Cart badge -->
          <Transition name="scale-fade">
            <span
              v-if="tab.to === '/retailer/cart' && cartStore.itemCount > 0"
              class="absolute top-1 right-1/4 bg-blue-600 text-white text-[9px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold leading-none shadow-md shadow-blue-500/30 bounce-in"
            >
              {{ cartStore.itemCount > 9 ? '9+' : cartStore.itemCount }}
            </span>
          </Transition>
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
