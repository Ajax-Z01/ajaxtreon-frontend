import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const protectedRoutesByRole: Record<string, string[]> = {
    admin: ['/admin'],
    seller: ['/seller'],
    customer: ['/customer']
  }

  const { user } = await getCurrentUserWithRole()

  if (!user || !user.role) return

  const allowedPrefixes = protectedRoutesByRole[user.role] || []
  const isAccessingDisallowedArea = Object.values(protectedRoutesByRole).some(prefixes => {
    return prefixes.some(prefix => to.path.startsWith(prefix)) && !allowedPrefixes.some(ap => to.path.startsWith(ap))
  })

  if (isAccessingDisallowedArea) {
    switch (user.role) {
      case 'admin':
        return navigateTo('/admin/dashboard')
      case 'seller':
        return navigateTo('/seller/dashboard')
      default:
        return navigateTo('/customer/dashboard')
    }
  }
})
