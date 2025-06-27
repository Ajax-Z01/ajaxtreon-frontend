import { defineNuxtRouteMiddleware, navigateTo, useCookie } from 'nuxt/app'
import { useUserStore } from '~/stores/userStore'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  if (import.meta.server) return

  const userStore = useUserStore()
  const token = useCookie('auth_token')?.value

  if (!userStore.isReady && !userStore.isFetching && token) {
    try {
      await userStore.fetchUser()
    } catch {
      return navigateTo('/auth/login')
    }
  }

  const publicPaths = ['/', '/auth']
  const isPublic = publicPaths.some(p => to.path.startsWith(p))
  if (isPublic) return

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
