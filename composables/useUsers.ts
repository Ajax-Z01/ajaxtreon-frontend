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

  // Fetch all users (Admin only)
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

  // Fetch user by ID
  const getUserById = async (id: string): Promise<User | null> => {
    try {
      const { data, error } = await useFetch<User>(`${baseUrl}/user/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch user' })
      }

      return data.value || null
    } catch (err) {
      console.error('Error fetching user by ID:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch user' })
    }
  }

  // Create new user
  const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
      const { data, error } = await useFetch<User>(`${baseUrl}/user`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to create user' })
      }

      return data.value!
    } catch (err) {
      console.error('Error creating user:', err)
      throw createError({ statusCode: 500, message: 'Failed to create user' })
    }
  }

  // Update user information
  const updateUserInfo = async (id: string, updatedData: Omit<User, 'id'>): Promise<User> => {
    try {
      const { data, error } = await useFetch<User>(`${baseUrl}/user/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedData),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to update user' })
      }

      return data.value!
    } catch (err) {
      console.error('Error updating user:', err)
      throw createError({ statusCode: 500, message: 'Failed to update user' })
    }
  }

  // Delete user
  const deleteUserInfo = async (id: string): Promise<void> => {
    try {
      const { error } = await useFetch(`${baseUrl}/user/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to delete user' })
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete user' })
    }
  }

  // Set user role (Admin only)
  const setUserRole = async (id: string, role: string): Promise<User> => {
    try {
      const { data, error } = await useFetch<User>(`${baseUrl}/user/${id}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role }),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to set user role' })
      }

      return data.value!
    } catch (err) {
      console.error('Error setting user role:', err)
      throw createError({ statusCode: 500, message: 'Failed to set user role' })
    }
  }

  return {
    getUsers,
    getUserById,
    createUser,
    updateUserInfo,
    deleteUserInfo,
    setUserRole,
  }
}
