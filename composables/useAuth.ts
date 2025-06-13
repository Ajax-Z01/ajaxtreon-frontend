import { ref } from 'vue'
import { useRuntimeConfig, useState, createError } from '#app'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import type { User } from '~/types/User'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl

  // State token di localStorage
  const userToken = useState<string | null>('userToken', () => {
    if (process.client) {
      return localStorage.getItem('userToken')
    }
    return null
  })

  // currentUser pakai tipe User sesuai definisi
  const currentUser = useState<User | null>('currentUser', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const setUserToken = (token: string | null) => {
    userToken.value = token
    if (process.client) {
      if (token) localStorage.setItem('userToken', token)
      else localStorage.removeItem('userToken')
    }
  }

  const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (userToken.value) {
      headers['Authorization'] = `Bearer ${userToken.value}`
    }
    return headers
  }

  // Sinkronisasi user dan token dari Firebase (mengembalikan boolean sukses)
  const syncUserFromFirebase = async (): Promise<boolean> => {
    try {
      const { user, token } = await getCurrentUserWithRole()
      console.log('[syncUserFromFirebase] user:', user)
      if (user && token) {
        // user.id exists as per your User interface (from Firestore doc)
        currentUser.value = {
          id: user.id,           // use 'id' instead of 'uid'
          name: user.name ?? '',
          email: user.email,
          role: user.role,
          isActive: user.isActive ?? true,
          createdAt: user.createdAt ?? new Date().toISOString(),
          profilePictureUrl: user.profilePictureUrl,
          phone: user.phone,
          address: user.address,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
        }
        setUserToken(token)
        return true
      } else {
        currentUser.value = null
        setUserToken(null)
        return false
      }
    } catch (err) {
      console.error('syncUserFromFirebase error:', err)
      currentUser.value = null
      setUserToken(null)
      return false
    }
  }

  const fetchCurrentUser = async () => {
    if (!userToken.value) {
      currentUser.value = null
      console.log('[fetchCurrentUser] no token, user reset')
      return
    }

    try {
      console.log('[fetchCurrentUser] fetching user from API with token:', userToken.value)
      const data = await $fetch<User>(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      })
      currentUser.value = data
      console.log('[fetchCurrentUser] got user:', data)
    } catch (err) {
      console.error('[fetchCurrentUser] error:', err)
      currentUser.value = null
      setUserToken(null)
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      console.log('[useAuth] login attempt:', email)

      // Login backend dulu
      const data = await $fetch<{ token: string; user: User }>(`${baseUrl}/auth/login`, {
        method: 'POST',
        body: { email, password },
        headers: { 'Content-Type': 'application/json' },
      })

      if (!data.token) throw new Error('Token not received')

      // Login ke Firebase Authentication otomatis
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)

      setUserToken(data.token)
      currentUser.value = data.user

      // Sinkronisasi user dari Firebase
      const synced = await syncUserFromFirebase().catch(() => false)
      if (!synced) {
        console.warn('[useAuth] syncUserFromFirebase failed, keeping backend user')
      }

      console.log('[useAuth] login success, user:', currentUser.value)
    } catch (err) {
      error.value = (err as Error).message || 'Login failed'
      console.error('[useAuth] login error:', err)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      })

      const auth = getAuth()
      await signOut(auth)
    } catch (err) {
      console.error('[useAuth] logout error:', err)
    } finally {
      setUserToken(null)
      currentUser.value = null
      loading.value = false
      if (process.client) {
        window.location.href = '/auth/login'
      }
    }
  }

  const initAuth = async () => {
    console.log('[useAuth] initAuth start, token:', userToken.value)
    if (userToken.value) {
      const synced = await syncUserFromFirebase()
      if (synced) {
        console.log('[useAuth] initAuth success, user:', currentUser.value)
      } else {
        console.log('[useAuth] initAuth failed, clearing token and user')
        setUserToken(null)
        currentUser.value = null
      }
    } else {
      console.log('[useAuth] initAuth: no token found')
    }
  }

  return {
    userToken,
    currentUser,
    error,
    loading,
    login,
    logout,
    initAuth,
    syncUserFromFirebase,
    fetchCurrentUser,
  }
}
