import { defineNuxtRouteMiddleware, navigateTo, useCookie } from 'nuxt/app'
import { useUserStore } from '~/stores/userStore'
import type { RouteLocationNormalized } from 'vue-router'

const publicPaths = ['/', '/auth']

const protectedRoutesByRole: Record<string, string[]> = {
  admin: ['/admin'],
  seller: ['/seller'],
  customer: ['/customer'],
}

function isPublicRoute(path: string) {
  return publicPaths.some(publicPath => path.startsWith(publicPath))
}

function getAllowedPrefixes(role: string) {
  return protectedRoutesByRole[role] || []
}

function isRouteProtected(path: string) {
  return Object.values(protectedRoutesByRole).some(prefixes =>
    prefixes.some(prefix => path.startsWith(prefix))
  )
}

function isAccessAllowed(path: string, role: string) {
  const allowedPrefixes = getAllowedPrefixes(role)
  return allowedPrefixes.some(prefix => path.startsWith(prefix))
}

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

  if (isPublicRoute(to.path)) return

  if (!userStore.user) {
    return navigateTo('/auth/login')
  }

  if (isRouteProtected(to.path) && !isAccessAllowed(to.path, userStore.user.role)) {
    switch (userStore.user.role) {
      case 'admin':
        return navigateTo('/admin/dashboard')
      case 'seller':
        return navigateTo('/seller/dashboard')
      case 'customer':
        return navigateTo('/customer/dashboard')
      default:
        return navigateTo('/')
    }
  }
})
