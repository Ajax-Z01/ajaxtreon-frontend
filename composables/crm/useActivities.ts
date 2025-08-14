import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { Activity, ActivityCreateInput, ActivityUpdatePayload } from '~/types/Activity'

export const useActivities = () => {
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

  const getAllActivities = async (): Promise<Activity[]> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Activity[]>(`${baseUrl}/activity`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch activities' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching activities:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch activities' })
    }
  }

  const getActivityById = async (id: string): Promise<Activity | null> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Activity>(`${baseUrl}/activity/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch activity' })
      }

      return data.value || null
    } catch (err) {
      console.error('Error fetching activity by ID:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch activity' })
    }
  }

  const getActivitiesByRelated = async (
    type: 'lead' | 'contact' | 'opportunity',
    relatedId: string,
  ): Promise<Activity[]> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Activity[]>(
        `${baseUrl}/activity/related/${type}/${relatedId}`,
        {
          method: 'GET',
          headers: getHeaders(),
        },
      )

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch related activities' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching related activities:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch related activities' })
    }
  }

  const createActivity = async (payload: ActivityCreateInput): Promise<Activity> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Activity>(`${baseUrl}/activity`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to create activity' })
      }

      return data.value!
    } catch (err) {
      console.error('Error creating activity:', err)
      throw createError({ statusCode: 500, message: 'Failed to create activity' })
    }
  }

  const updateActivity = async (id: string, payload: ActivityUpdatePayload): Promise<Activity> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Activity>(`${baseUrl}/activity/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to update activity' })
      }

      return data.value!
    } catch (err) {
      console.error('Error updating activity:', err)
      throw createError({ statusCode: 500, message: 'Failed to update activity' })
    }
  }

  const deleteActivity = async (id: string): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/activity/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to delete activity' })
      }
    } catch (err) {
      console.error('Error deleting activity:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete activity' })
    }
  }

  return {
    ensureToken,
    getAllActivities,
    getActivityById,
    getActivitiesByRelated,
    createActivity,
    updateActivity,
    deleteActivity,
  }
}
