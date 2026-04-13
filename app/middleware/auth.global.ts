export default defineNuxtRouteMiddleware((to) => {
  const publicPaths = ['/login', '/no-access']
  if (publicPaths.includes(to.path)) return

  const authStore = useAuthStore()

  if (!authStore.initialized) return

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Role-based route protection
  const path = to.path
  if (path.startsWith('/wholesaler') && !authStore.isWholesaler) {
    return navigateTo('/')
  }
  if (path.startsWith('/retailer') && !authStore.isRetailer && !authStore.isWholesaler) {
    return navigateTo('/')
  }
  if (path.startsWith('/delivery') && !authStore.isDelivery) {
    return navigateTo('/')
  }
})
