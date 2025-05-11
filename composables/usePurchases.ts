import type { Purchase, CreatePurchasePayload, UpdatePurchasePayload } from '~/types/Purchase'

export const usePurchases = () => {
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

  const getPurchases = async (): Promise<Purchase[]> => {
    const { data, error } = await useFetch<Purchase[]>(`${baseUrl}/purchase`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch purchases' })
    }

    return data.value || []
  }

  const addPurchase = async (purchase: CreatePurchasePayload): Promise<string> => {
    const { data, error, status } = await useFetch<{ id: string }>(`${baseUrl}/purchase`, {
      method: 'POST',
      body: purchase,
      headers: getHeaders(),
    })
  
    if (error.value) {
      const message = error.value?.data?.message || 'Failed to add purchase'
      throw createError({ statusCode: Number(status.value) || 500, message })
    }
  
    return data.value?.id || ''
  }

  const updatePurchaseStatus = async (id: string, update: UpdatePurchasePayload): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/purchase/${id}/status`, {
      method: 'PUT',
      body: update,
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to update purchase' })
    }
  }

  const deletePurchase = async (id: string): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/purchase/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to delete purchase' })
    }
  }

  return {
    getPurchases,
    addPurchase,
    updatePurchaseStatus,
    deletePurchase,
  }
}
