<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateUser from '~/components/ModalCreateUser.vue'
import ModalEditUser from '~/components/ModalEditUser.vue'
import { useUsers } from '~/composables/useUsers'
import type { User } from '~/types/User'

const users = ref<User[]>([]) // Typing the users array
const selectedUser = ref<User | null>(null) // Typing selectedUser with User type or null
const { getUsers, getUserById, createUser, updateUserInfo, deleteUserInfo, setUserRole } = useUsers() // Destructure functions from useUsers

const showCreateModal = ref(false) // Modal state for create user
const showEditModal = ref(false) // Modal state for edit user

// Fetch users on component mount
onMounted(async () => {
  try {
    users.value = await getUsers() // Fetch users when the component mounts
  } catch (error) {
    console.error('Error fetching users:', error)
  }
})

const handleCreateUser = (userData: {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
}) => {
  createUser(userData)
  const tempId = 'temp-id-' + Date.now();
  users.value.push({ ...userData, id: tempId })
  showCreateModal.value = false
}

const handleUpdateUser = (userData: {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  password: string
}) => {
  updateUserInfo(userData.id, userData)
  const index = users.value.findIndex(user => user.id === userData.id)
  if (index !== -1) {
    users.value[index] = { ...users.value[index], ...userData }
  }
  showEditModal.value = false
}

const fetchUserById = (userId: string) => {
  selectedUser.value = users.value.find(user => user.id === userId) || null // Ensure selectedUser is either User or null
  showEditModal.value = true
}

// Delete user
const deleteUser = async (userId: string) => {
  try {
    await deleteUserInfo(userId) // Call deleteUserInfo to delete the user
    users.value = users.value.filter(user => user.id !== userId) // Remove the user from the list
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

// Set user role (Admin only)
const setUserRoleForUser = async (userId: string, role: 'admin' | 'user') => {
  try {
    const updatedUser = await setUserRole(userId, role) // Set the role of the user
    const index = users.value.findIndex(user => user.id === userId)
    if (index !== -1) {
      users.value[index] = updatedUser // Update the user in the list with the new role
    }
    users.value = await getUsers()
  } catch (error) {
    console.error('Error setting user role:', error)
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
    
    <h1 class="text-3xl font-bold mb-6">User Management</h1>

    <!-- Add User Button -->
    <div class="mb-4 text-right">
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New User
      </button>
    </div>

    <!-- User List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Users</h2>
      <table class="min-w-full table-auto">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Email</th>
            <th class="px-4 py-2 text-left">Role</th>
            <th class="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="px-4 py-2">{{ user.id }}</td>
            <td class="px-4 py-2">{{ user.name }}</td>
            <td class="px-4 py-2">{{ user.email }}</td>
            <td class="px-4 py-2">{{ user.role }}</td>
            <td class="px-4 py-2">
              <button
                @click="fetchUserById(user.id)"
                class="text-blue-500 hover:text-blue-700 mr-4"
              >
                Edit
              </button>
              <button
                @click="deleteUser(user.id)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
              <button
                @click="setUserRoleForUser(user.id, 'admin')"
                class="text-green-500 hover:text-green-700 ml-4"
              >
                Set Admin
              </button>
              <button
                @click="setUserRoleForUser(user.id, 'user')"
                class="text-yellow-500 hover:text-yellow-700 ml-4"
              >
                Set User
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create User -->
    <ModalCreateUser :showModal="showCreateModal" @closeModal="showCreateModal = false" @createUser="handleCreateUser" />

    <!-- Modal Edit User -->
    <ModalEditUser :showModal="showEditModal" :selectedUser="selectedUser" @closeModal="showEditModal = false" @updateUser="handleUpdateUser" />
  </div>
</template>
