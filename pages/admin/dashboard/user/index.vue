<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateUser from '~/components/modal/CreateUser.vue'
import ModalEditUser from '~/components/modal/EditUser.vue'
import { useUsers } from '~/composables/useUsers'
import { useToast } from '~/composables/useToast'
import type { User } from '~/types/User'

const users = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isLoading = ref(false)

const { getUsers, getUserById, createUser, updateUserInfo, deleteUserInfo, setUserRole } = useUsers()
const { addToast } = useToast()

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  isLoading.value = true
  try {
    users.value = await getUsers()
  } catch (error) {
    console.error('Error fetching users:', error)
    addToast('Failed to load users', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleCreateUser = async (userData: any) => {
  isLoading.value = true
  try {
    await createUser({
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    })
    await loadUsers()
    showCreateModal.value = false
    addToast('User created successfully', 'success')
  } catch (error) {
    console.error('Error creating user:', error)
    addToast('Failed to create user', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleUpdateUser = async (userData: any) => {
  isLoading.value = true
  try {
    const existingUser = users.value.find(u => u.id === userData.id)
    if (!existingUser) throw new Error('User not found')

    const { id, ...rest } = userData
    await updateUserInfo(id, {
      ...rest,
      createdAt: existingUser.createdAt,
      isActive: existingUser.isActive,
    })

    await loadUsers()
    showEditModal.value = false
    addToast('User updated successfully', 'success')
  } catch (error) {
    console.error('Error updating user:', error)
    addToast('Failed to update user', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchUserById = async (userId: string) => {
  isLoading.value = true
  try {
    selectedUser.value = await getUserById(userId)
    showEditModal.value = true
  } catch (error) {
    console.error('Error fetching user:', error)
    addToast('Failed to fetch user', 'error')
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async (userId: string) => {
  isLoading.value = true
  try {
    await deleteUserInfo(userId)
    users.value = users.value.filter(u => u.id !== userId)
    addToast('User deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting user:', error)
    addToast('Failed to delete user', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleRoleChange = async (e: Event, userId: string) => {
  const target = e.target as HTMLSelectElement | null
  if (target?.value) {
    isLoading.value = true
    try {
      await setUserRole(userId, target.value as User['role'])
      await loadUsers()
      addToast('User role updated', 'success')
    } catch (error) {
      console.error('Error setting user role:', error)
      addToast('Failed to update role', 'error')
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <!-- Header -->
    <NuxtLink
      to="/admin/dashboard"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>

    <h1 class="text-3xl font-bold mb-6">User Management</h1>

    <!-- Add User Button -->
    <div class="mb-4 text-right">
      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Add User
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-4">
      <span class="text-gray-600 text-sm">Loading...</span>
    </div>
    <!-- Table -->
    <div v-if="!isLoading" class="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h2 class="text-xl font-semibold mb-4">Users</h2>
      <table class="min-w-full table-auto border-separate border-spacing-y-2 text-sm">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Name</th>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Role</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="bg-white hover:bg-gray-50"
          >
            <td class="px-4 py-2">{{ user.id }}</td>
            <td class="px-4 py-2">{{ user.name }}</td>
            <td class="px-4 py-2">{{ user.email }}</td>
            <td class="px-4 py-2">
              <select
                :value="user.role"
                class="border rounded px-2 py-1"
                @change="(e) => handleRoleChange(e, user.id)"
              >
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            </td>
            <td class="px-4 py-2 space-x-2">
              <button
                @click="fetchUserById(user.id)"
                class="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                @click="deleteUser(user.id)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
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
