import { defineNuxtRouteMiddleware, navigateTo, useCookie } from 'nuxt/app'
import { getAuth } from 'firebase/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = getAuth()
  const tokenCookie = useCookie('auth_token')
  let token = tokenCookie.value

  // Kalau token gak ada dan route butuh auth, redirect login
  if (!token && !['/auth', '/'].some(path => to.path.startsWith(path))) {
    return navigateTo('/auth/login')
  }

  // Contoh cek validasi token dengan backend, retry kalau expired
  async function validateToken(t: string) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` }
      })
      if (res.status === 401) throw new Error('Unauthorized')
      return true
    } catch {
      return false
    }
  }

  if (token) {
    const valid = await validateToken(token)
    if (!valid) {
      try {
        const user = auth.currentUser
        if (!user) throw new Error('No logged in user')

        // Force refresh token
        token = await user.getIdToken(true)
        tokenCookie.value = token

        // Optional: cek ulang token baru
        const validAfterRefresh = await validateToken(token)
        if (!validAfterRefresh) throw new Error('Token still invalid')
      } catch {
        tokenCookie.value = null
        return navigateTo('/auth/login')
      }
    }
  }
})
