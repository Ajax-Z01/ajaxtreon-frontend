import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useUserStore } from '~/stores/userStore'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  if (import.meta.server) return

  const userStore = useUserStore()

  if (!userStore.isReady && !userStore.isFetching) {
    try {
      await userStore.fetchUser()
    } catch {
      return navigateTo('/auth/login')
    }
  }

  const publicPages = ['/', '/auth/login', '/auth/register', '/auth/register-seller']
  if (publicPages.includes(to.path)) return

  if (!userStore.user) {
    return navigateTo('/auth/login')
  }

  const protectedRoutesByRole: Record<string, string[]> = {
    admin: ['/admin'],
    seller: ['/seller'],
    customer: ['/customer'],
  }

  const allowedPrefixes = protectedRoutesByRole[userStore.user.role] || []
  const isAccessingDisallowedArea = Object.values(protectedRoutesByRole).some(prefixes =>
    prefixes.some(prefix => to.path.startsWith(prefix)) &&
    !allowedPrefixes.some(ap => to.path.startsWith(ap))
  )

  if (isAccessingDisallowedArea) {
    switch (userStore.user.role) {
      case 'admin':
        return navigateTo('/admin/dashboard')
      case 'seller':
        return navigateTo('/seller/dashboard')
      case 'customer':
        return navigateTo('/customer/dashboard')
    }
  }
})
