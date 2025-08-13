import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { Lead, LeadCreateInput, LeadUpdatePayload } from '~/types/Lead'

export const useLeads = () => {
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

  // Get lead by ID (authenticated route)
  const getLeadById = async (id: string): Promise<Lead | null> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Lead>(`${baseUrl}/leads/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch lead' })
      }

      return data.value || null
    } catch (err) {
      console.error('Error fetching lead by ID:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch lead' })
    }
  }

  // Get all leads (admin only)
  const getLeads = async (): Promise<Lead[]> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Lead[]>(`${baseUrl}/leads`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch leads' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching leads:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch leads' })
    }
  }

  const createLead = async (payload: LeadCreateInput): Promise<Lead> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Lead>(`${baseUrl}/leads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to create lead' })
      }

      return data.value!
    } catch (err) {
      console.error('Error creating lead:', err)
      throw createError({ statusCode: 500, message: 'Failed to create lead' })
    }
  }

  const updateLead = async (id: string, payload: LeadUpdatePayload): Promise<Lead> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Lead>(`${baseUrl}/leads/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to update lead' })
      }

      return data.value!
    } catch (err) {
      console.error('Error updating lead:', err)
      throw createError({ statusCode: 500, message: 'Failed to update lead' })
    }
  }

  const deleteLead = async (id: string): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/leads/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to delete lead' })
      }
    } catch (err) {
      console.error('Error deleting lead:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete lead' })
    }
  }

  return {
    ensureToken,
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
  }
}
