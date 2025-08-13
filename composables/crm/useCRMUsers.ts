import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { CRMUser, CRMUserCreateInput, CRMUserUpdatePayload } from '~/types/CRMUser'

export const useCRMUsers = () => {
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

  // Public: get user by email (no auth)
  const getUserByEmail = async (email: string): Promise<CRMUser | null> => {
    try {
      const { data, error } = await useFetch<CRMUser>(`${baseUrl}/users/email/${email}`, {
        method: 'GET',
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch user by email' })
      }

      return data.value || null
    } catch (err) {
      console.error('Error fetching user by email:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch user by email' })
    }
  }

  // Authenticated routes
  const getCRMUsers = async (): Promise<CRMUser[]> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<CRMUser[]>(`${baseUrl}/users`, {
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

  const getCRMUserById = async (id: string): Promise<CRMUser | null> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<CRMUser>(`${baseUrl}/users/${id}`, {
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

  const createCRMUser = async (payload: CRMUserCreateInput): Promise<CRMUser> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<CRMUser>(`${baseUrl}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
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

  const updateCRMUser = async (id: string, payload: CRMUserUpdatePayload): Promise<CRMUser> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<CRMUser>(`${baseUrl}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
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

  const deleteCRMUser = async (id: string): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/users/${id}`, {
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

  return {
    ensureToken,
    getUserByEmail,
    getCRMUsers,
    getCRMUserById,
    createCRMUser,
    updateCRMUser,
    deleteCRMUser,
  }
}
