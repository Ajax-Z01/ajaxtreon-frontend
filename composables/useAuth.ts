import { useNuxtApp, useCookie } from '#app'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type AuthError,
  type User,
} from 'firebase/auth'
import { ref } from 'vue'

export const useAuth = () => {
  const { $auth } = useNuxtApp()

  const error = ref<string | null>(null)
  const loading = ref(false)
  const token = ref<string | null>(null)

  const currentUser = useState<User | null>('currentUser', () => null)
  const authReady = useState<boolean>('authReady', () => false)

  const authCookie = useCookie('auth_token', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  })

  // Inisialisasi Auth
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged($auth, async (user) => {
        currentUser.value = user
        authReady.value = true

        if (user) {
          token.value = await user.getIdToken()
          authCookie.value = token.value

          if (process.client) {
            localStorage.setItem('userToken', token.value)
          }
        } else {
          token.value = null
          authCookie.value = null

          if (process.client) {
            localStorage.removeItem('userToken')
          }
        }

        resolve()
      })
    })
  }

  // Login
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const userCredential = await signInWithEmailAndPassword($auth, email, password)
      const user = userCredential.user

      token.value = await user.getIdToken()
      currentUser.value = user
      authReady.value = true

      authCookie.value = token.value

      if (process.client) {
        localStorage.setItem('userToken', token.value)
      }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message || 'Unknown error occurred during login.'
      console.error('Login error:', authError)
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      await signOut($auth)
      currentUser.value = null
      token.value = null
      authCookie.value = null

      if (process.client) {
        localStorage.removeItem('userToken')
      }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message || 'Unknown error occurred during logout.'
      console.error('Logout error:', authError)
    } finally {
      loading.value = false
    }
  }

  return {
    login,
    logout,
    error,
    loading,
    token,
    currentUser,
    authReady,
    initAuth,
  }
}
