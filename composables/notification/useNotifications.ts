import { useRuntimeConfig, useFetch, createError, useCookie } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { Notification } from '~/types/Notification'

export const useNotifications = () => {
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

  const getNotifications = async (): Promise<Notification[]> => {
  await ensureToken()
  const { data, error } = await useFetch<{ success: boolean; data: Notification[] }>(
    `${baseUrl}/notification/me`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  )
  if (error.value) {
    console.error('Fetch error:', error.value)
    throw createError({ statusCode: 500, message: 'Failed to fetch notifications' })
  }
  console.log('API Response data:', data.value)
  return data.value?.data || []
}


  const markAsRead = async (id: string): Promise<void> => {
    await ensureToken()
    const { error } = await useFetch(`${baseUrl}/notification/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    })
    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to mark notification as read' })
    }
  }

  return {
    getNotifications,
    markAsRead,
  }
}
