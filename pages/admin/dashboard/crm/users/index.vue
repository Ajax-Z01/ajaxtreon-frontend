<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateCRMUser from '~/components/modal/CreateCRMUser.vue'
import ModalEditCRMUser from '~/components/modal/EditCRMUser.vue'
import { useCRMUsers } from '~/composables/crm/useCRMUsers'
import { useToast } from '~/composables/utils/useToast'
import type { CRMUser, CRMUserCreateInput, CRMUserUpdatePayload } from '~/types/CRMUser'

const users = ref<CRMUser[]>([])
const selectedUser = ref<CRMUser | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getCRMUsers, getCRMUserById, createCRMUser, updateCRMUser, deleteCRMUser } = useCRMUsers()
const { addToast } = useToast()

const loadUsers = async () => {
  try {
    users.value = await getCRMUsers()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch users', 'error')
  }
}

onMounted(loadUsers)

const handleCreateUser = async (data: CRMUserCreateInput) => {
  try {
    await createCRMUser(data)
    await loadUsers()
    addToast('User created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create user', 'error')
  }
}

const handleUpdateUser = async (id: string, data: CRMUserUpdatePayload) => {
  try {
    await updateCRMUser(id, data)
    await loadUsers()
    addToast('User updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update user', 'error')
  }
}

const fetchUserById = async (id: string) => {
  try {
    selectedUser.value = await getCRMUserById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load user data', 'error')
  }
}

const removeUser = async (id: string) => {
  try {
    await deleteCRMUser(id)
    users.value = users.value.filter(u => u.id !== id)
    addToast('User deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete user', 'error')
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <NuxtLink
        to="/admin/dashboard/crm"
        class="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition text-center md:text-left"
      >
        ← Back to CRM Dashboard
      </NuxtLink>

      <h1 class="text-2xl md:text-3xl font-bold text-center md:text-left">
        CRM Users Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add User
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Role</th>
            <th class="px-4 py-3 text-left">Active</th>
            <th class="px-4 py-3 text-left">Last Login</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 text-sm">
            <td class="px-4 py-3 font-medium whitespace-nowrap">{{ user.name }}</td>
            <td class="px-4 py-3">{{ user.email }}</td>
            <td class="px-4 py-3 capitalize">{{ user.role }}</td>
            <td class="px-4 py-3">{{ user.isActive ? 'Yes' : 'No' }}</td>
            <td class="px-4 py-3">{{ user.lastLoginAt || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchUserById(user.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeUser(user.id)"
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
    <ModalCreateCRMUser
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createUser="handleCreateUser"
    />

    <ModalEditCRMUser
      :showModal="showEditModal"
      :selectedUser="selectedUser"
      @closeModal="showEditModal = false"
      @updateUser="(data) => selectedUser && handleUpdateUser(selectedUser.id, data)"
    />
  </div>
</template>
