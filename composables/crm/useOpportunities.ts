import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { Opportunity, OpportunityCreateInput, OpportunityUpdatePayload } from '~/types/Opportunity'

export const useOpportunities = () => {
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

  const getOpportunities = async (): Promise<Opportunity[]> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Opportunity[]>(`${baseUrl}/opportunities`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch opportunities' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching opportunities:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch opportunities' })
    }
  }

  const getOpportunityById = async (id: string): Promise<Opportunity | null> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Opportunity>(`${baseUrl}/opportunities/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch opportunity' })
      }

      return data.value || null
    } catch (err) {
      console.error('Error fetching opportunity by ID:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch opportunity' })
    }
  }

  const createOpportunity = async (payload: OpportunityCreateInput): Promise<Opportunity> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Opportunity>(`${baseUrl}/opportunities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to create opportunity' })
      }

      return data.value!
    } catch (err) {
      console.error('Error creating opportunity:', err)
      throw createError({ statusCode: 500, message: 'Failed to create opportunity' })
    }
  }

  const updateOpportunity = async (id: string, payload: OpportunityUpdatePayload): Promise<Opportunity> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Opportunity>(`${baseUrl}/opportunities/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to update opportunity' })
      }

      return data.value!
    } catch (err) {
      console.error('Error updating opportunity:', err)
      throw createError({ statusCode: 500, message: 'Failed to update opportunity' })
    }
  }

  const deleteOpportunity = async (id: string): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/opportunities/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to delete opportunity' })
      }
    } catch (err) {
      console.error('Error deleting opportunity:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete opportunity' })
    }
  }

  return {
    ensureToken,
    getOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
  }
}
