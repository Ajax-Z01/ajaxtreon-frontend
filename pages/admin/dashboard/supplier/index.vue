<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateSupplier from '~/components/modal/CreateSupplier.vue'
import ModalEditSupplier from '~/components/modal/EditSupplier.vue'
import { useSuppliers } from '~/composables/useSuppliers'
import { useToast } from '~/composables/useToast'
import type { Supplier, SupplierCreateInput, SupplierUpdateInput } from '~/types/Supplier'

const suppliers = ref<Supplier[]>([])
const selectedSupplier = ref<Supplier | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier } = useSuppliers()
const { addToast } = useToast()

const loadSuppliers = async () => {
  try {
    suppliers.value = await getSuppliers()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch suppliers', 'error')
  }
}

onMounted(loadSuppliers)

const handleCreateSupplier = async (supplierData: SupplierCreateInput) => {
  try {
    await createSupplier(supplierData)
    await loadSuppliers()
    addToast('Supplier created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create supplier', 'error')
  }
}

const handleUpdateSupplier = async (payload: SupplierUpdateInput & { id: string }) => {
  try {
    const { id, ...updatedData } = payload
    await updateSupplier(id, updatedData)
    await loadSuppliers()
    addToast('Supplier updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update supplier', 'error')
  }
}

const fetchSupplierById = async (id: string) => {
  try {
    selectedSupplier.value = await getSupplierById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load supplier', 'error')
  }
}

const removeSupplier = async (id: string) => {
  try {
    await deleteSupplier(id)
    suppliers.value = suppliers.value.filter(s => s.id !== id)
    addToast('Supplier deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete supplier', 'error')
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <!-- Header + Navigation -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <NuxtLink
        to="/admin/dashboard"
        class="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition text-center md:text-left"
      >
        ← Back to Dashboard
      </NuxtLink>

      <h1 class="text-2xl md:text-3xl font-bold text-center md:text-left">
        Supplier Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add Supplier
      </button>
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow-md">
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
            v-for="supplier in suppliers"
            :key="supplier.id"
            class="hover:bg-gray-50 text-sm"
          >
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="font-medium">{{ supplier.name }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">{{ supplier.email || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ supplier.phone || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchSupplierById(supplier.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeSupplier(supplier.id)"
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
