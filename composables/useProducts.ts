import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from '~/types/Product'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'

export const useProducts = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl

  // Token state
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

  // GET: All Products
  const getProducts = async (): Promise<Product[]> => {
    try {
      const { data, error } = await useFetch<Product[]>(`${baseUrl}/inventory/product`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching products:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch products' })
    }
  }

  // POST: Create Product
  const addProduct = async (product: CreateProductPayload): Promise<string> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<{ id: string }>(`${baseUrl}/inventory/product`, {
        method: 'POST',
        body: product,
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }

      return data.value?.id || ''
    } catch (err) {
      console.error('Error adding product:', err)
      throw createError({ statusCode: 500, message: 'Failed to add product' })
    }
  }

  // PUT: Update Product
  const updateProduct = async (id: string, update: UpdateProductPayload): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/inventory/product/${id}`, {
        method: 'PUT',
        body: update,
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }
    } catch (err) {
      console.error('Error updating product:', err)
      throw createError({ statusCode: 500, message: 'Failed to update product' })
    }
  }

  // DELETE: Delete Product
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/inventory/product/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete product' })
    }
  }

  return {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  }
}
