import type { StockChangePayload } from '~/types/Stock'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'
import { useProducts } from '~/composables/useProducts'

export const useStocks = () => {
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

  const { getProducts } = useProducts()

  // GET: Stock (mapped from products)
  const getStocks = async (): Promise<any[]> => {
    try {
      await ensureToken()
      const products = await getProducts()

      return products.map((product) => ({
        productId: product.id,
        productName: product.name,
        quantity: product.stock,
      }))
    } catch (err) {
      console.error('Error fetching stocks:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch stocks' })
    }
  }

  // POST: Add Stock
  const addStock = async (productId: string, quantity: number, note = ''): Promise<void> => {
    try {
      await ensureToken()
      const { error } = await useFetch(`${baseUrl}/inventory/stock/add-stock/${productId}`, {
        method: 'POST',
        body: { quantity, note },
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }
    } catch (err) {
      console.error('Error adding stock:', err)
      throw createError({ statusCode: 500, message: 'Failed to add stock' })
    }
  }

  // POST: Subtract Stock
  const subtractStock = async (productId: string, quantity: number, note = ''): Promise<void> => {
    try {
      await ensureToken()
      const { error } = await useFetch(`${baseUrl}/inventory/stock/subtract-stock/${productId}`, {
        method: 'POST',
        body: { quantity, note },
        headers: getHeaders(),
      })

      if (error.value) {
        throw error.value
      }
    } catch (err) {
      console.error('Error subtracting stock:', err)
      throw createError({ statusCode: 500, message: 'Failed to subtract stock' })
    }
  }

  // GET: Stock History
  const getStockHistory = async (productId: string): Promise<StockChangePayload[]> => {
    try {
      await ensureToken()
      const { data, error } = await useFetch<StockChangePayload[]>(
        `${baseUrl}/inventory/stock/stock-history/${productId}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      )

      if (error.value) {
        throw error.value
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching stock history:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch stock history' })
    }
  }

  return {
    getStocks,
    addStock,
    subtractStock,
    getStockHistory,
  }
}
