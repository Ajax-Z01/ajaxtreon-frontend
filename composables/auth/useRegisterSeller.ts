import { ref } from 'vue'

export const useRegisterSeller = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl

  const registerError = ref<string | null>(null)
  const loading = ref(false)

  const registerSeller = async (email: string, password: string, name: string) => {
    loading.value = true
    registerError.value = null

    try {
      const { data, error } = await useFetch(`${baseUrl}/auth/register-seller`, {
        method: 'POST',
        body: { email, password, name, role: 'seller' },
      })

      if (error.value) {
        registerError.value = error.value.message || 'Seller registration failed'
        throw new Error('Failed to register seller')
      }

      console.log('Seller registration successful:', data.value)

    } catch (err: unknown) {
      if (err instanceof Error) {
        registerError.value = err.message || 'Unexpected error occurred during seller registration.'
        console.error('Seller registration error:', err)
      } else {
        registerError.value = 'Unknown error occurred during seller registration.'
        console.error('Unknown error during seller registration:', err)
      }
    } finally {
      loading.value = false
    }
  }

  return {
    registerSeller,
    registerError,
    loading,
  }
}
