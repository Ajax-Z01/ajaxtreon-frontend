// middleware/seller-only.ts
import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'

export default defineNuxtRouteMiddleware(async () => {
  const token = useCookie('auth_token')
  if (!token.value) return navigateTo('/auth/login')

  try {
    const { user } = await getCurrentUserWithRole()

    if (!user) {
      console.warn('User not found from token.')
      return navigateTo('/auth/login')
    }

    if (user.role !== 'seller') {
      switch (user.role) {
        case 'admin':
          return navigateTo('/admin/dashboard')
        case 'customer':
          return navigateTo('/customer/dashboard')
        default:
          return navigateTo('/auth/login')
      }
    }

    // Seller valid, lanjut ke halaman seller
    return
  } catch (error) {
    console.error('Error in seller-only middleware:', error)
    return navigateTo('/auth/login')
  }
})
