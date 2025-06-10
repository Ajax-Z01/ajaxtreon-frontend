import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useCurrentUser } from '~/composables/useCurrentUser'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const authPages = ['/auth/login', '/auth/register', '/auth/register-seller']
  if (!authPages.includes(to.path)) return

  const { user } = await useCurrentUser()

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
