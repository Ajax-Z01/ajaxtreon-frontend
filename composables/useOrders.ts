import type { Order, CreateOrderPayload, UpdateOrderPayload } from '~/types/Inventory'

export const useOrders = () => {
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

  const getOrders = async (): Promise<Order[]> => {
    const { data, error } = await useFetch<Order[]>(`${baseUrl}/inventory/order`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch orders' })
    }

    return data.value || []
  }

  const addOrder = async (order: CreateOrderPayload): Promise<string> => {
    const { data, error } = await useFetch<{ id: string }>(`${baseUrl}/inventory/order`, {
      method: 'POST',
      body: order,
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to add order' })
    }

    return data.value?.id || ''
  }

  const updateOrder = async (id: string, update: UpdateOrderPayload): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/order/${id}`, {
      method: 'PUT',
      body: update,
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to update order' })
    }
  }

  const deleteOrder = async (id: string): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/inventory/order/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to delete order' })
    }
  }

  return {
    getOrders,
    addOrder,
    updateOrder,
    deleteOrder,
  }
}
