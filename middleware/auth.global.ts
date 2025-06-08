// middleware/auth.global.ts
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const publicPages = ['/auth/login', '/auth/register', '/auth/register-seller']
  if (publicPages.includes(to.path)) return

  const user = await getCurrentUserWithToken()
  if (!user || !user.user) {
    return navigateTo('/auth/login')
  }
})
