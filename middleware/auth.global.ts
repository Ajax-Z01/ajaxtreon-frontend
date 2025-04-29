import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const publicPages = ['/', '/auth/login', '/auth/register']
  if (publicPages.includes(to.path)) return

  const user = await getCurrentUser()
  if (!user) {
    return navigateTo('/auth/login')
  }
})
