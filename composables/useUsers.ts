import { useCookie, useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'
import type { User } from '~/types/User'

export const useUsers = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const authToken = useCookie<string | null>('authToken')

  // Store user token in state for better persistence across the app
  const userToken = useState('userToken', () => authToken.value)

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (userToken.value) {
      headers['Authorization'] = `Bearer ${userToken.value}`
    }

    return headers
  }

  const getUsers = async (): Promise<User[]> => {
    try {
      // Ensure the token is set first
      if (!userToken.value) {
        const { token } = await getCurrentUserWithToken()

        if (token) {
          userToken.value = token
          authToken.value = token // Save token in cookie for persistence
        }
      }

      // Wait until we have the token
      if (!userToken.value) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
      }

      const { data, error } = await useFetch<User[]>(`${baseUrl}/user`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch users' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching users:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch users' })
    }
  }

  return {
    getUsers,
  }
}
