import { defineStore } from 'pinia'
import type { Customer } from '~/types/Customer'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)

  const fetchCustomers = async () => {
    if (customers.value.length > 0) return
    loading.value = true
    try {
      const { data, error } = await useFetch<Customer[]>('/api/customers')
      if (error.value) throw error.value
      customers.value = data.value || []
    } finally {
      loading.value = false
    }
  }

  const getCustomerName = (id: string): string => {
    const customer = customers.value.find(c => c.id === id)
    return customer?.name || 'Unknown Customer'
  }

  return { customers, fetchCustomers, getCustomerName, loading }
})
