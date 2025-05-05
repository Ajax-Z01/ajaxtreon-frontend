import { ref } from 'vue'

export const useRegister = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl

  const registerError = ref<string | null>(null)
  const loading = ref(false)

  const register = async (email: string, password: string, name: string) => {
    loading.value = true
    registerError.value = null
    const role = 'user'

    try {
      const { data, error } = await useFetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        body: { email, password, name, role },
      })

      if (error.value) {
        registerError.value = error.value.message || 'Registration failed'
        throw createError({ statusCode: 500, message: 'Failed to register' })
      }

      console.log('Registration successful:', data.value)
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        registerError.value = err.message || 'Unexpected error occurred during registration.'
        console.error('Registration error:', err)
      } else {
        registerError.value = 'Unknown error occurred during registration.'
        console.error('Unknown error during registration:', err)
      }
    } finally {
      loading.value = false
    }
  }

  // Add function for retrieving user profile
  const getUserProfile = async (token: string) => {
    try {
      const { data, error } = await useFetch(`${baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (error.value) {
        throw new Error(error.value.message || 'Error fetching user profile')
      }

      return data.value

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching user profile:', err)
      }
      throw new Error('Error fetching user profile')
    }
  }

  return {
    register,
    registerError,
    loading,
    getUserProfile,
  }
}
