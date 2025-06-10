import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'

export default defineNuxtRouteMiddleware(async () => {
  const token = useCookie('auth_token')
  if (!token.value) return navigateTo('/auth/login')

  try {
    const { user } = await getCurrentUserWithRole()

    if (user?.role !== 'admin') {
      switch (user?.role) {
        case 'seller':
          return navigateTo('/seller/dashboard')
        case 'customer':
          return navigateTo('/customer/dashboard')
        default:
          return navigateTo('/auth/login')
      }
    }
  } catch {
    return navigateTo('/auth/login')
  }
})
