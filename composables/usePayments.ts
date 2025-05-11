import type { Payment, PaymentData } from '~/types/Payment'

export const usePayment = () => {
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

  // Create payment
  const createPayment = async (paymentData: PaymentData): Promise<Payment | void> => {
    const { data, error } = await useFetch<Payment>(`${baseUrl}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Error creating payment' })
    }

    return data.value || undefined
  }

  // Get all payments
  const getAllPayments = async (): Promise<Payment[]> => {
    const { data, error } = await useFetch<Payment[]>(`${baseUrl}/payment`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Error fetching payments' })
    }

    return data.value || []
  }

  // Get payment by ID
  const getPaymentById = async (id: string): Promise<Payment | void> => {
    const { data, error } = await useFetch<Payment>(`${baseUrl}/payment/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Error fetching payment' })
    }

    return data.value || undefined
  }

  // Update payment status
  const updatePaymentStatus = async (id: string, status: string): Promise<Payment | void> => {
    const { data, error } = await useFetch<Payment>(`${baseUrl}/payment/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Error updating payment status' })
    }

    return data.value || undefined
  }

  // Delete payment
  const deletePayment = async (id: string): Promise<void> => {
    const { error } = await useFetch(`${baseUrl}/payment/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Error deleting payment' })
    }
  }

  return {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    deletePayment,
  }
}
