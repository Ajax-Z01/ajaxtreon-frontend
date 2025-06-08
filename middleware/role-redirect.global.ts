import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'

export default defineNuxtRouteMiddleware(async (to) => {
  const authPages = ['/auth/login', '/auth/register', '/auth/register-seller']
  if (!authPages.includes(to.path)) return

  const { user } = await getCurrentUserWithRole()

  if (user && user.role) {
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
