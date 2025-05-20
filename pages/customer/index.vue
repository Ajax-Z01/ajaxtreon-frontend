<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateCustomer from '~/components/modal/CreateCustomer.vue'
import ModalEditCustomer from '~/components/modal/EditCustomer.vue'
import { useCustomers } from '~/composables/useCustomers'
import type { Customer, CustomerCreateInput, CustomerUpdateInput } from '~/types/Customer'

const customers = ref<Customer[]>([])
const selectedCustomer = ref<Customer | null>(null)
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = useCustomers()

const showCreateModal = ref(false)
const showEditModal = ref(false)

onMounted(async () => {
  try {
    customers.value = await getCustomers()
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
})

const handleCreateCustomer = async (customerData: CustomerCreateInput) => {
  try {
    const created = await createCustomer(customerData)
    customers.value.push(created)
    customers.value = await getCustomers()
    showCreateModal.value = false
  } catch (error) {
    console.error('Error creating customer:', error)
  }
}

const handleUpdateCustomer = async (payload: CustomerUpdateInput) => {
  try {
    const { id, ...updatedData } = payload
    const updated = await updateCustomer(id, updatedData)
    customers.value = customers.value.map(c => (c.id === id ? updated : c))
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating customer:', error)
  }
}



const fetchCustomerById = async (id: string) => {
  try {
    selectedCustomer.value = await getCustomerById(id)
    if (selectedCustomer.value) {
      showEditModal.value = true
    }
  } catch (error) {
    console.error('Error fetching customer by ID:', error)
  }
}

const removeCustomer = async (id: string) => {
  try {
    await deleteCustomer(id)
    customers.value = customers.value.filter(c => c.id !== id)
  } catch (error) {
    console.error('Error deleting customer:', error)
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/dashboard"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>

    <h1 class="text-3xl font-bold mb-6">Customer Management</h1>

    <!-- Add Customer Button -->
    <div class="mb-4 text-right">
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Customer
      </button>
    </div>

    <!-- Customer List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Customers</h2>
      <table class="min-w-full table-auto">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Email</th>
            <th class="px-4 py-2 text-left">Phone</th>
            <th class="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td class="px-4 py-2">{{ customer.id }}</td>
            <td class="px-4 py-2">{{ customer.name }}</td>
            <td class="px-4 py-2">{{ customer.email || '-' }}</td>
            <td class="px-4 py-2">{{ customer.phone || '-' }}</td>
            <td class="px-4 py-2">
              <button
                @click="fetchCustomerById(customer.id)"
                class="text-blue-500 hover:text-blue-700 mr-4"
              >
                Edit
              </button>
              <button
                @click="removeCustomer(customer.id)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create Customer -->
    <ModalCreateCustomer
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createCustomer="handleCreateCustomer"
    />

    <!-- Modal Edit Customer -->
    <ModalEditCustomer
      :showModal="showEditModal"
      :selectedCustomer="selectedCustomer"
      @closeModal="showEditModal = false"
      @updateCustomer="handleUpdateCustomer"
    />
  </div>
</template>
