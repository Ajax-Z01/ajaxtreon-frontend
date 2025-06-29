<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateSeller from '~/components/modal/CreateSeller.vue'
import ModalEditSeller from '~/components/modal/EditSeller.vue'
import { useSellers } from '~/composables/useSellers'
import { useToast } from '~/composables/useToast'
import type { Seller, SellerCreateInput, SellerUpdatePayload } from '~/types/Seller'

const sellers = ref<Seller[]>([])
const selectedSeller = ref<Seller | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getSellers, getSellerById, createSeller, updateSeller, deleteSeller } = useSellers()
const { addToast } = useToast()

const loadSellers = async () => {
  try {
    sellers.value = await getSellers()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch sellers', 'error')
  }
}

onMounted(loadSellers)

const handleCreateSeller = async (sellerData: SellerCreateInput) => {
  try {
    await createSeller(sellerData)
    await loadSellers()
    addToast('Seller created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create seller', 'error')
  }
}

const handleUpdateSeller = async (payload: SellerUpdatePayload & { id: string }) => {
  try {
    const { id, ...data } = payload
    await updateSeller(id, data)
    await loadSellers()
    addToast('Seller updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update seller', 'error')
  }
}

const fetchSellerById = async (id: string) => {
  try {
    selectedSeller.value = await getSellerById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load seller', 'error')
  }
}

const removeSeller = async (id: string) => {
  try {
    await deleteSeller(id)
    sellers.value = sellers.value.filter(s => s.id !== id)
    addToast('Seller deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete seller', 'error')
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
        Seller Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add Seller
      </button>
    </div>

    <!-- Seller Table -->
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
            v-for="seller in sellers"
            :key="seller.id"
            class="hover:bg-gray-50 text-sm"
          >
            <td class="px-4 py-3 font-medium whitespace-nowrap">
              {{ seller.name }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">{{ seller.email || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ seller.phone || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchSellerById(seller.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeSeller(seller.id)"
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

    <!-- Modal: Create -->
    <ModalCreateSeller
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createSeller="handleCreateSeller"
    />

    <!-- Modal: Edit -->
    <ModalEditSeller
      :showModal="showEditModal"
      :selectedSeller="selectedSeller"
      @closeModal="showEditModal = false"
      @updateSeller="handleUpdateSeller"
    />
  </div>
</template>
