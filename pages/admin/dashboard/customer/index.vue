<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateCustomer from '~/components/modal/CreateCustomer.vue'
import ModalEditCustomer from '~/components/modal/EditCustomer.vue'
import { useCustomers } from '~/composables/useCustomers'
import { useToast } from '~/composables/useToast'
import type { Customer, CustomerCreateInput, CustomerUpdateInput } from '~/types/Customer'

const customers = ref<Customer[]>([])
const selectedCustomer = ref<Customer | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
const { addToast } = useToast()

const loadCustomers = async () => {
  try {
    customers.value = await getCustomers()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch customers', 'error')
  }
}

onMounted(loadCustomers)

const handleCreateCustomer = async (customerData: CustomerCreateInput) => {
  try {
    await createCustomer(customerData)
    await loadCustomers()
    addToast('Customer created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create customer', 'error')
  }
}

const handleUpdateCustomer = async (payload: CustomerUpdateInput) => {
  try {
    const { id, ...updatedData } = payload
    await updateCustomer(id, updatedData)
    await loadCustomers()
    addToast('Customer updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update customer', 'error')
  }
}

const fetchCustomerById = async (id: string) => {
  try {
    selectedCustomer.value = await getCustomerById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load customer data', 'error')
  }
}

const removeCustomer = async (id: string) => {
  try {
    await deleteCustomer(id)
    customers.value = customers.value.filter(c => c.id !== id)
    addToast('Customer deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete customer', 'error')
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <NuxtLink
        to="/admin/dashboard"
        class="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition text-center md:text-left"
      >
        ← Back to Dashboard
      </NuxtLink>

      <h1 class="text-2xl md:text-3xl font-bold text-center md:text-left">
        Customer Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add Customer
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Phone</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="customer in customers"
            :key="customer.id"
            class="hover:bg-gray-50 text-sm"
          >
            <td class="px-4 py-3 font-medium whitespace-nowrap">
              {{ customer.name }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">{{ customer.email || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ customer.phone || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchCustomerById(customer.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeCustomer(customer.id)"
                  class="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <ModalCreateCustomer
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createCustomer="handleCreateCustomer"
    />

    <ModalEditCustomer
      :showModal="showEditModal"
      :selectedCustomer="selectedCustomer"
      @closeModal="showEditModal = false"
      @updateCustomer="handleUpdateCustomer"
    />
  </div>
</template>
