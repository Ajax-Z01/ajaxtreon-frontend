<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateSeller from '~/components/modal/CreateSeller.vue'
import ModalEditSeller from '~/components/modal/EditSeller.vue'
import { useSellers } from '~/composables/useSellers'
import type { Seller, SellerCreateInput, SellerUpdatePayload } from '~/types/Seller'

const sellers = ref<Seller[]>([])
const selectedSeller = ref<Seller | null>(null)
const { getSellers, getSellerById, createSeller, updateSeller, deleteSeller } = useSellers()

const showCreateModal = ref(false)
const showEditModal = ref(false)

onMounted(async () => {
  try {
    sellers.value = await getSellers()
  } catch (error) {
    console.error('Error fetching sellers:', error)
  }
})

const handleCreateSeller = async (sellerData: SellerCreateInput) => {
  try {
    const created = await createSeller(sellerData)
    sellers.value.push(created)
    sellers.value = await getSellers()
    showCreateModal.value = false
  } catch (error) {
    console.error('Error creating seller:', error)
  }
}

const handleUpdateSeller = async (payload: SellerUpdatePayload & { id: string }) => {
  try {
    const { id, ...updatedData } = payload
    const updated = await updateSeller(id, updatedData)
    sellers.value = sellers.value.map(s => (s.id === id ? updated : s))
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating seller:', error)
  }
}

const fetchSellerById = async (id: string) => {
  try {
    selectedSeller.value = await getSellerById(id)
    if (selectedSeller.value) {
      showEditModal.value = true
    }
  } catch (error) {
    console.error('Error fetching seller by ID:', error)
  }
}

const removeSeller = async (id: string) => {
  try {
    await deleteSeller(id)
    sellers.value = sellers.value.filter(s => s.id !== id)
  } catch (error) {
    console.error('Error deleting seller:', error)
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/seller/dashboard"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>

    <h1 class="text-3xl font-bold mb-6">Seller Management</h1>

    <!-- Add Seller Button -->
    <div class="mb-4 text-right">
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Seller
      </button>
    </div>

    <!-- Seller List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Sellers</h2>
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
          <tr v-for="seller in sellers" :key="seller.id">
            <td class="px-4 py-2">{{ seller.id }}</td>
            <td class="px-4 py-2">{{ seller.name }}</td>
            <td class="px-4 py-2">{{ seller.email || '-' }}</td>
            <td class="px-4 py-2">{{ seller.phone || '-' }}</td>
            <td class="px-4 py-2">
              <button
                @click="fetchSellerById(seller.id)"
                class="text-blue-500 hover:text-blue-700 mr-4"
              >
                Edit
              </button>
              <button
                @click="removeSeller(seller.id)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create Seller -->
    <ModalCreateSeller
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createSeller="handleCreateSeller"
    />

    <!-- Modal Edit Seller -->
    <ModalEditSeller
      :showModal="showEditModal"
      :selectedSeller="selectedSeller"
      @closeModal="showEditModal = false"
      @updateSeller="handleUpdateSeller"
    />
  </div>
</template>
