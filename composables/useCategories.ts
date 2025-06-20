import type { Category } from '~/types/Category'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'

export const useCategories = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl

  const userToken = useState<string | null>('userToken', () => {
    if (process.client) {
      return localStorage.getItem('userToken')
    }
    return null
  })

  const setUserToken = (token: string) => {
    userToken.value = token
    if (process.client) {
      localStorage.setItem('userToken', token)
    }
  }

  const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (userToken.value) {
      headers['Authorization'] = `Bearer ${userToken.value}`
    }

    return headers
  }

  const ensureToken = async () => {
    if (!userToken.value) {
      const { token } = await getCurrentUserWithToken()
      if (token) {
        setUserToken(token)
      } else {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
      }
    }
  }

  const getCategories = async (): Promise<Category[]> => {
    try {
      await ensureToken()
      const { data, error } = await useFetch<Category[]>(`${baseUrl}/inventory/category`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching categories:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch categories' })
    }
  }

  const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
    try {
      await ensureToken()
      const { data, error } = await useFetch<{ id: string }>(`${baseUrl}/inventory/category`, {
        method: 'POST',
        body: category,
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }

      return data.value?.id || ''
    } catch (err) {
      console.error('Error adding category:', err)
      throw createError({ statusCode: 500, message: 'Failed to add category' })
    }
  }

  const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
    try {
      await ensureToken()
      const { error } = await useFetch(`${baseUrl}/inventory/category/${id}`, {
        method: 'PUT',
        body: category,
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }
    } catch (err) {
      console.error('Error updating category:', err)
      throw createError({ statusCode: 500, message: 'Failed to update category' })
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await ensureToken()
      const { error } = await useFetch(`${baseUrl}/inventory/category/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete category' })
    }
  }

  return {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
