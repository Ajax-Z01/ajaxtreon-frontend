import { useProducts } from '~/composables/useProducts'
import type { StockChangePayload } from '~/types/Stock'

export const useStocks = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const authToken = useCookie<string | null>('authToken')

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authToken.value) {
      headers['Authorization'] = `Bearer ${authToken.value}`
    }

    return headers
  }

  const { getProducts } = useProducts()
  
  const getStocks = async (): Promise<any[]> => {
    const products = await getProducts()
    
    return products.map((product) => ({
      productId: product.id,
      productName: product.name,
      quantity: product.stock,
    }))
  }

  const addStock = async (id: string, quantity: number, note: string = ''): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/stock/add-stock/${id}`, {
      method: 'POST',
      body: { quantity, note },
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to add stock' })
    }
  }

  const subtractStock = async (id: string, quantity: number, note: string = ''): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/stock/subtract-stock/${id}`, {
      method: 'POST',
      body: { quantity, note },
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to subtract stock' })
    }
  }

  const getStockHistory = async (id: string): Promise<StockChangePayload[]> => {
    const { data, error } = await useFetch<StockChangePayload[]>(`${baseUrl}/inventory/stock/stock-history/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch stock history' })
    }

    return data.value || []
  }

  return {
    getStocks,
    addStock,
    subtractStock,
    getStockHistory,
  }
}
