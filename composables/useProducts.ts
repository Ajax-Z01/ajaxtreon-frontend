import type { Product } from '~/types/Inventory'

export const useProducts = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl

  const getProducts = async () => {
    const { data, error } = await useFetch<Product[]>(`${baseUrl}/product`, { method: 'GET' })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch products' })
    }

    return data.value || []
  }

  const addProduct = async (product: { name: string; price: number; stock: number }) => {
    const { error } = await useFetch(`${baseUrl}/product`, {
      method: 'POST',
      body: product,
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to add product' })
    }
  }

  const updateProduct = async (id: string, update: Partial<{ name: string; price: number; stock: number }>) => {
    const { error } = await useFetch(`${baseUrl}/product/${id}`, {
      method: 'PUT',
      body: update,
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to update product' })
    }
  }

  const deleteProduct = async (id: string) => {
    const { error } = await useFetch(`${baseUrl}/product/${id}`, {
      method: 'DELETE',
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to delete product' })
    }
  }

  return { getProducts, addProduct, updateProduct, deleteProduct }
}