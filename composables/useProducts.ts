import type { Product, CreateProductPayload, UpdateProductPayload } from '~/types/Inventory'

export const useProducts = () => {
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

  const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await useFetch<Product[]>(`${baseUrl}/inventory/product`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch products' })
    }

    return data.value || []
  }

  const addProduct = async (product: CreateProductPayload): Promise<string> => {
    const { data, error } = await useFetch<{ id: string }>(`${baseUrl}/inventory/product`, {
      method: 'POST',
      body: product,
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to add product' })
    }

    return data.value?.id || ''
  }

  const updateProduct = async (id: string, update: UpdateProductPayload): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/product/${id}`, {
      method: 'PUT',
      body: update,
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to update product' })
    }
  }

  const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/product/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to delete product' })
    }
  }

  return {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
  }
}
