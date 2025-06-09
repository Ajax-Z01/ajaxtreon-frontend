import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'

export default defineNuxtRouteMiddleware(async () => {
  const { user } = await getCurrentUserWithRole()
  if (!user || user.role !== 'admin') {
    return navigateTo('/')
  }
})
