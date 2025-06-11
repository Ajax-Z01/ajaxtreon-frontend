import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore()

  if (!userStore.isReady) {
    try {
      await userStore.fetchUser()
    } catch {
      return navigateTo('/auth/login')
    }
  }

  if (!userStore.user) return navigateTo('/auth/login')

  if (userStore.user.role !== 'admin') {
    switch (userStore.user.role) {
      case 'seller':
        return navigateTo('/seller/dashboard')
      case 'customer':
        return navigateTo('/customer/dashboard')
      default:
        return navigateTo('/auth/login')
    }
  }
})
