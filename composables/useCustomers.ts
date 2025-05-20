import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'
import type { Customer, CustomerCreateInput, CustomerUpdatePayload } from '~/types/Customer'

export const useCustomers = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl

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

  const getHeaders = () => {
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

  const getCustomers = async (): Promise<Customer[]> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Customer[]>(`${baseUrl}/customer`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch customers' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching customers:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch customers' })
    }
  }

  const getCustomerById = async (id: string): Promise<Customer | null> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Customer>(`${baseUrl}/customer/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch customer' })
      }

      return data.value || null
    } catch (err) {
      console.error('Error fetching customer by ID:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch customer' })
    }
  }

  const createCustomer = async (customerData: CustomerCreateInput): Promise<Customer> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Customer>(`${baseUrl}/customer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(customerData),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to create customer' })
      }

      return data.value!
    } catch (err) {
      console.error('Error creating customer:', err)
      throw createError({ statusCode: 500, message: 'Failed to create customer' })
    }
  }

  const updateCustomer = async (id: string, updatedData: CustomerUpdatePayload): Promise<Customer> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Customer>(`${baseUrl}/customer/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedData),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to update customer' })
      }

      return data.value!
    } catch (err) {
      console.error('Error updating customer:', err)
      throw createError({ statusCode: 500, message: 'Failed to update customer' })
    }
  }

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/customer/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to delete customer' })
      }
    } catch (err) {
      console.error('Error deleting customer:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete customer' })
    }
  }

  return {
    ensureToken,
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  }
}
