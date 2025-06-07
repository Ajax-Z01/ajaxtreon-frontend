import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  // List of public pages that don't require login
  const publicPages = ['/', '/auth/login', '/auth/register', '/auth/register-seller']
  
  // Skip public pages from authentication check
  if (publicPages.includes(to.path)) return

  // Check if the user is logged in
  const user = await getCurrentUserWithToken()
  if (!user || !user.user) {
    console.log('User not authenticated, redirecting to login...')
    return navigateTo('/auth/login')
  }
})
