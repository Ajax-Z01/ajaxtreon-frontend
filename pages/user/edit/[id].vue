<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsers } from '~/composables/useUsers'
import type { User } from '~/types/User'

const route = useRoute()
const router = useRouter()
const { getUserById, updateUserInfo } = useUsers()

const userId = route.params.id as string
const form = ref<Omit<User, 'id'>>({
  name: '',
  email: '',
  role: 'user',
})

// Fetch user data on mount
onMounted(async () => {
  try {
    const user = await getUserById(userId)
    if (user) {
      form.value = {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
})

// Submit updated data
const submitForm = async () => {
  try {
    await updateUserInfo(userId, form.value)
    router.push('/user')
  } catch (error) {
    console.error('Error updating user:', error)
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/user"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to User Management
    </NuxtLink>

    <h1 class="text-3xl font-bold mb-6">Edit User</h1>

    <div class="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Role</label>
          <select
            v-model="form.role"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="text-right">
          <button
            type="submit"
            class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Update User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
