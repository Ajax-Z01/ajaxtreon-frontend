<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateUser from '~/components/modal/CreateUser.vue'
import ModalEditUser from '~/components/modal/EditUser.vue'
import { useUsers } from '~/composables/useUsers'
import { useToast } from '~/composables/useToast'
import type { User, UserUpdateInput } from '~/types/User'
import { Plus, Edit3, Trash2, LoaderCircle } from 'lucide-vue-next'

const users = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isLoading = ref(false)

const { getUsers, getUserById, createUser, updateUserInfo, deleteUserInfo, setUserRole } = useUsers()
const { addToast } = useToast()

const loadUsers = async () => {
  isLoading.value = true
  try {
    users.value = await getUsers()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch users', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadUsers)

const handleCreateUser = async (userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password: string }) => {
  isLoading.value = true
  try {
    await createUser({ ...userData, createdAt: new Date().toISOString(), isActive: true })
    await loadUsers()
    addToast('User created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create user', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleUpdateUser = async (payload: UserUpdateInput & { id: string }) => {
  isLoading.value = true
  try {
    const existing = users.value.find(u => u.id === payload.id)
    if (!existing) throw new Error('User not found')

    const { id, ...data } = payload

    await updateUserInfo(id, {
      ...existing,
      ...data
    })

    await loadUsers()
    addToast('User updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update user', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchUserById = async (id: string) => {
  isLoading.value = true
  try {
    selectedUser.value = await getUserById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load user data', 'error')
  } finally {
    isLoading.value = false
  }
}

const removeUser = async (id: string) => {
  isLoading.value = true
  try {
    await deleteUserInfo(id)
    users.value = users.value.filter(u => u.id !== id)
    addToast('User deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete user', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleRoleChange = async (event: Event, userId: string) => {
  const target = event.target as HTMLSelectElement
  const role = target?.value
  if (!role) return

  isLoading.value = true
  try {
    await setUserRole(userId, role as User['role'])
    await loadUsers()
    addToast('User role updated', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to update role', 'error')
  } finally {
    isLoading.value = false
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

      <h1 class="text-2xl md:text-3xl font-bold text-center md:text-left">User Management</h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
      >
        <Plus class="w-4 h-4" /> Add User
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-10 text-gray-600">
      <LoaderCircle class="animate-spin w-5 h-5 mr-2" /> Loading users...
    </div>

    <!-- Empty State -->
    <div v-else-if="users.length === 0" class="text-center text-gray-500 py-10">
      No users found.
    </div>

    <!-- Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Role</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium whitespace-nowrap">{{ user.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ user.email }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <select
                :value="user.role"
                @change="(e) => handleRoleChange(e, user.id)"
                class="border px-2 py-1 rounded"
              >
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button @click="fetchUserById(user.id)" class="text-blue-600 hover:underline flex items-center gap-1">
                  <Edit3 class="w-4 h-4" /> Edit
                </button>
                <button @click="removeUser(user.id)" class="text-red-600 hover:underline flex items-center gap-1">
                  <Trash2 class="w-4 h-4" /> Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <ModalCreateUser
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createUser="handleCreateUser"
    />

    <ModalEditUser
      :showModal="showEditModal"
      :selectedUser="selectedUser"
      @closeModal="showEditModal = false"
      @updateUser="handleUpdateUser"
    />
  </div>
</template>
