import { defineStore } from 'pinia'
import type { Product } from '~/types/Inventory'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)

  const fetchProducts = async () => {
    if (products.value.length > 0) return
    loading.value = true
    try {
      const { data, error } = await useFetch<Product[]>('/api/products')
      if (error.value) throw error.value
      products.value = data.value || []
    } finally {
      loading.value = false
    }
  }

  const getProductName = (id: string): string => {
    const product = products.value.find(p => p.id === id)
    return product?.name || 'Unknown Product'
  }

  return { products, fetchProducts, getProductName, loading }
})
