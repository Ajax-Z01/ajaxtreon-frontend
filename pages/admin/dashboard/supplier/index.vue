<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateSupplier from '~/components/modal/CreateSupplier.vue'
import ModalEditSupplier from '~/components/modal/EditSupplier.vue'
import { useSuppliers } from '~/composables/useSuppliers'
import type { Supplier, SupplierCreateInput, SupplierUpdateInput } from '~/types/Supplier'

const suppliers = ref<Supplier[]>([])
const selectedSupplier = ref<Supplier | null>(null)
const { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier } = useSuppliers()

const showCreateModal = ref(false)
const showEditModal = ref(false)

onMounted(async () => {
  try {
    suppliers.value = await getSuppliers()
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
})

const handleCreateSupplier = async (supplierData: SupplierCreateInput) => {
  try {
    const created = await createSupplier(supplierData)
    suppliers.value.push(created)
    suppliers.value = await getSuppliers()
    showCreateModal.value = false
  } catch (error) {
    console.error('Error creating supplier:', error)
  }
}

const handleUpdateSupplier = async (payload: {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}) => {
  try {
    const { id, ...updatedData } = payload
    const updated = await updateSupplier(id, updatedData)
    suppliers.value = suppliers.value.map(s => (s.id === id ? updated : s))
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating supplier:', error)
  }
}

const fetchSupplierById = async (id: string) => {
  try {
    selectedSupplier.value = await getSupplierById(id)
    if (selectedSupplier.value) {
      showEditModal.value = true
    }
  } catch (error) {
    console.error('Error fetching supplier by ID:', error)
  }
}

const removeSupplier = async (id: string) => {
  try {
    await deleteSupplier(id)
    suppliers.value = suppliers.value.filter(s => s.id !== id)
  } catch (error) {
    console.error('Error deleting supplier:', error)
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

    <h1 class="text-3xl font-bold mb-6">Supplier Management</h1>

    <!-- Add Supplier Button -->
    <div class="mb-4 text-right">
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Supplier
      </button>
    </div>

    <!-- Supplier List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Suppliers</h2>
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
          <tr v-for="supplier in suppliers" :key="supplier.id">
            <td class="px-4 py-2">{{ supplier.id }}</td>
            <td class="px-4 py-2">{{ supplier.name }}</td>
            <td class="px-4 py-2">{{ supplier.email || '-' }}</td>
            <td class="px-4 py-2">{{ supplier.phone || '-' }}</td>
            <td class="px-4 py-2">
              <button
                @click="fetchSupplierById(supplier.id)"
                class="text-blue-500 hover:text-blue-700 mr-4"
              >
                Edit
              </button>
              <button
                @click="removeSupplier(supplier.id)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create Supplier -->
    <ModalCreateSupplier
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createSupplier="handleCreateSupplier"
    />

    <!-- Modal Edit Supplier -->
    <ModalEditSupplier
      :showModal="showEditModal"
      :selectedSupplier="selectedSupplier"
      @closeModal="showEditModal = false"
      @updateSupplier="handleUpdateSupplier"
    />
  </div>
</template>
