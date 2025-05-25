import type { Category } from '~/types/Category'

export const useCategories = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const authToken = useCookie<string | null>('authToken')

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (authToken.value) {
      headers['Authorization'] = `Bearer ${authToken.value}`
    }

    return headers
  }

  const getCategories = async (): Promise<Category[]> => {
    const { data, error } = await useFetch<Category[]>(`${baseUrl}/inventory/category`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch categories' })
    }

    return data.value || []
  }

  const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
    const { data, error } = await useFetch<{ id: string }>(`${baseUrl}/inventory/category`, {
      method: 'POST',
      body: category,
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to add category' })
    }

    return data.value?.id || ''
  }

  const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/category/${id}`, {
      method: 'PUT',
      body: category,
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to update category' })
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/category/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (error.value) {
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
