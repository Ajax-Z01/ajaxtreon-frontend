import { useRuntimeConfig, useFetch, createError, useState } from '#app'
import { getCurrentUserWithToken } from '~/composables/auth/getCurrentUser'
import type { Contact, ContactCreateInput, ContactUpdatePayload } from '~/types/Contact'

export const useContacts = () => {
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

  const getContacts = async (): Promise<Contact[]> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Contact[]>(`${baseUrl}/contacts`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch contacts' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching contacts:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch contacts' })
    }
  }

  const getContactById = async (id: string): Promise<Contact | null> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Contact>(`${baseUrl}/contacts/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch contact' })
      }

      return data.value || null
    } catch (err) {
      console.error('Error fetching contact by ID:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch contact' })
    }
  }

  const createContact = async (payload: ContactCreateInput): Promise<Contact> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Contact>(`${baseUrl}/contacts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to create contact' })
      }

      return data.value!
    } catch (err) {
      console.error('Error creating contact:', err)
      throw createError({ statusCode: 500, message: 'Failed to create contact' })
    }
  }

  const updateContact = async (id: string, payload: ContactUpdatePayload): Promise<Contact> => {
    try {
      await ensureToken()

      const { data, error } = await useFetch<Contact>(`${baseUrl}/contacts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to update contact' })
      }

      return data.value!
    } catch (err) {
      console.error('Error updating contact:', err)
      throw createError({ statusCode: 500, message: 'Failed to update contact' })
    }
  }

  const deleteContact = async (id: string): Promise<void> => {
    try {
      await ensureToken()

      const { error } = await useFetch(`${baseUrl}/contacts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to delete contact' })
      }
    } catch (err) {
      console.error('Error deleting contact:', err)
      throw createError({ statusCode: 500, message: 'Failed to delete contact' })
    }
  }

  // Optional: get contacts by leadId (public route, no auth)
  const getContactsByLeadId = async (leadId: string): Promise<Contact[]> => {
    try {
      const { data, error } = await useFetch<Contact[]>(`${baseUrl}/contacts/lead/${leadId}`, {
        method: 'GET',
      })

      if (error.value) {
        throw createError({ statusCode: 500, message: 'Failed to fetch contacts by leadId' })
      }

      return data.value || []
    } catch (err) {
      console.error('Error fetching contacts by leadId:', err)
      throw createError({ statusCode: 500, message: 'Failed to fetch contacts by leadId' })
    }
  }

  return {
    ensureToken,
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    getContactsByLeadId,
  }
}
