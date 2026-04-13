export default defineNuxtRouteMiddleware(async (to) => {
  // Public pages that don't require auth
  const publicPaths = ['/login', '/no-access']
  const isPublicPage = publicPaths.some(p => to.path === p || to.path.startsWith(p + '/'))

  // On server/prerender, skip auth checks
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Wait for auth to initialize before making any decisions
  if (!authStore.initialized) {
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => authStore.initialized,
        (ready) => {
          if (ready) {
            stop()
            resolve()
          }
        },
        { immediate: true },
      )
    })
  }

  // After auth is initialized, enforce rules
  if (isPublicPage) {
    // Redirect authenticated users away from login
    if (authStore.isAuthenticated && to.path === '/login') {
      return navigateTo('/')
    }
    return
  }

  // Not authenticated → redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Role-based route protection
  const path = to.path

  // Strip locale prefix for role checks (e.g., /ml/wholesaler/... → /wholesaler/...)
  const normalizedPath = path.replace(/^\/(en|ml)/, '')

  if (normalizedPath.startsWith('/wholesaler') && !authStore.isWholesaler) {
    return navigateTo('/')
  }
  if (normalizedPath.startsWith('/retailer') && !authStore.isRetailer && !authStore.isWholesaler) {
    return navigateTo('/')
  }
  if (normalizedPath.startsWith('/delivery') && !authStore.isDelivery) {
    return navigateTo('/')
  }
})
