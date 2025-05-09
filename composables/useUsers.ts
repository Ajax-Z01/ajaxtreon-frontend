import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'
import type { User } from '~/types/User'

export const useUsers = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl

  // Store user token in state
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

  const getUsers = async (): Promise<User[]> => {
    try {
      await ensureToken()

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

  const getUserById = async (id: string): Promise<User | null> => {
    try {
      await ensureToken()

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

  const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
      await ensureToken()

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

  const updateUserInfo = async (id: string, updatedData: Omit<User, 'id'>): Promise<User> => {
    try {
      await ensureToken()

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

  const deleteUserInfo = async (id: string): Promise<void> => {
    try {
      await ensureToken()

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

  const setUserRole = async (id: string, role: string): Promise<User> => {
    try {
      await ensureToken()

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
    ensureToken,
    getUsers,
    getUserById,
    createUser,
    updateUserInfo,
    deleteUserInfo,
    setUserRole,
  }
}
