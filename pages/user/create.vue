<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '~/composables/useUsers'
import type { User } from '~/types/User'

const router = useRouter()
const { createUser } = useUsers()

// Tambahkan password ke form
const form = ref<Omit<User, 'id'> & { password: string }>({
  name: '',
  email: '',
  role: 'user',
  password: '',
})

// Submit untuk membuat user baru
const submitForm = async () => {
  try {
    await createUser(form.value)
    router.push('/user')
  } catch (error) {
    console.error('Error creating user:', error)
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

    <h1 class="text-3xl font-bold mb-6">Create New User</h1>

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

        <!-- Field password -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
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
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
