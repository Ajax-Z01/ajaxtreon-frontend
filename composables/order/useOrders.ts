import { useRuntimeConfig, useFetch, createError, useCookie } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { Order, CreateOrderPayload, UpdateOrderPayload } from '~/types/Order'

export const useOrders = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const authToken = useCookie<string | null>('authToken')

  const setAuthToken = (token: string) => {
    authToken.value = token
  }

  const ensureToken = async () => {
    if (!authToken.value) {
      const { token } = await getCurrentUserWithToken()
      if (token) {
        setAuthToken(token)
      } else {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
      }
    }
  }

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (authToken.value) {
      headers['Authorization'] = `Bearer ${authToken.value}`
    }
    return headers
  }

  const getOrders = async (): Promise<Order[]> => {
    await ensureToken()
    const { data, error } = await useFetch<Order[]>(`${baseUrl}/order`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch orders' })
    }

    return data.value || []
  }

  const addOrder = async (order: CreateOrderPayload): Promise<string> => {
    await ensureToken()
    const { data, error, status } = await useFetch<{ id: string }>(`${baseUrl}/order`, {
      method: 'POST',
      body: JSON.stringify(order),
      headers: getHeaders(),
    })

    if (error.value) {
      const message = error.value?.data?.message || 'Failed to add order'
      throw createError({ statusCode: Number(status.value) || 500, message })
    }

    return data.value?.id || ''
  }

  const updateOrder = async (id: string, update: UpdateOrderPayload): Promise<void> => {
    await ensureToken()
    const { error } = await useFetch(`${baseUrl}/order/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to update order' })
    }
  }

  const deleteOrder = async (id: string): Promise<void> => {
    await ensureToken()
    const { error } = await useFetch(`${baseUrl}/order/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to delete order' })
    }
  }

  return {
    ensureToken,
    getOrders,
    addOrder,
    updateOrder,
    deleteOrder,
  }
}
