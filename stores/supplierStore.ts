import { defineStore } from 'pinia'
import type { Supplier } from '~/types/Supplier'
import { ref } from 'vue'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSuppliers = async () => {
    if (suppliers.value.length > 0) return
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch<Supplier[]>('/api/suppliers')
      if (fetchError.value) throw fetchError.value
      suppliers.value = data.value || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch suppliers'
    } finally {
      loading.value = false
    }
  }

  const getSupplierName = (id: string): string => {
    const supplier = suppliers.value.find(s => s.id === id)
    return supplier?.name || 'Unknown Supplier'
  }

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    getSupplierName,
  }
})
