import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { Supplier, SupplierCreateInput, SupplierUpdatePayload } from '~/types/Supplier'

export const useSuppliers = () => {
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

  const getSuppliers = async (): Promise<Supplier[]> => {
    try {
      await ensureToken()
      const { data, error } = await useFetch<Supplier[]>(`${baseUrl}/supplier`, {
        method: 'GET',
        headers: getHeaders(),
      })
      if (error.value) throw createError({ statusCode: 500, message: 'Failed to fetch suppliers' })
      return data.value || []
    } catch (err) {
      console.error('Error fetching suppliers:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch suppliers' })
    }
  }

  const getSupplierById = async (id: string): Promise<Supplier | null> => {
    try {
      await ensureToken()
      const { data, error } = await useFetch<Supplier>(`${baseUrl}/supplier/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      })
      if (error.value) throw createError({ statusCode: 500, message: 'Failed to fetch supplier' })
      return data.value || null
    } catch (err) {
      console.error('Error fetching supplier by ID:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch supplier' })
    }
  }

  const createSupplier = async (supplierData: Omit<SupplierCreateInput, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    try {
      await ensureToken()
      const { data, error } = await useFetch<Supplier>(`${baseUrl}/supplier`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(supplierData),
      })
      if (error.value) throw createError({ statusCode: 500, message: 'Failed to create supplier' })
      return data.value!
    } catch (err) {
      console.error('Error creating supplier:', err)
      throw createError({ statusCode: 500, message: 'Failed to create supplier' })
    }
  }

  const updateSupplier = async (id: string, updatedData: Partial<Omit<SupplierUpdatePayload, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Supplier> => {
    try {
      await ensureToken()
      const { data, error } = await useFetch<Supplier>(`${baseUrl}/supplier/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedData),
      })
      if (error.value) throw createError({ statusCode: 500, message: 'Failed to update supplier' })
      return data.value!
    } catch (err) {
      console.error('Error updating supplier:', err)
      throw createError({ statusCode: 500, message: 'Failed to update supplier' })
    }
  }

  const deleteSupplier = async (id: string): Promise<void> => {
    try {
      await ensureToken()
      const { error } = await useFetch(`${baseUrl}/supplier/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (error.value) throw createError({ statusCode: 500, message: 'Failed to delete supplier' })
    } catch (err) {
      console.error('Error deleting supplier:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete supplier' })
    }
  }

  return {
    ensureToken,
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}
