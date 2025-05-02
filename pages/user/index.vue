<script setup>
import { ref, onMounted } from 'vue'
import { useUsers } from '~/composables/useUsers'
import { useRouter } from 'vue-router'

const users = ref([])
const { getUsers } = useUsers()
const router = useRouter()

// Fetch users on component mount
onMounted(async () => {
    try {
        users.value = await getUsers()
    } catch (error) {
        console.error('Error fetching users:', error)
    }
})

// Delete user function
const deleteUser = async (userId) => {
    // Add your delete logic here, e.g., make a delete API call
    try {
        console.log(`Deleting user with ID: ${userId}`)
        // You can call an API to delete the user, and then refetch the user list
        users.value = users.value.filter(user => user.id !== userId)
    } catch (error) {
        console.error('Error deleting user:', error)
    }
}
</script>

<template>
    <div class="p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6">User Management</h1>
  
      <!-- Add User Button -->
      <div class="mb-4 text-right">
        <router-link
          to="/user/create"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New User
        </router-link>
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
              <th class="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="px-4 py-2">{{ user.id }}</td>
              <td class="px-4 py-2">{{ user.name }}</td>
              <td class="px-4 py-2">{{ user.email }}</td>
              <td class="px-4 py-2">
                <router-link
                  :to="`/user/edit/${user.id}`"
                  class="text-blue-500 hover:text-blue-700 mr-4"
                >
                  Edit
                </router-link>
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
    </div>
</template>