<script setup lang="ts">
import { ref, watchEffect, defineProps, defineEmits } from 'vue'

// Tipe props
const { showModal, selectedUser } = defineProps<{
  showModal: boolean
  selectedUser: {
    id: string
    name: string
    email: string
    role: 'user' | 'admin'
  } | null
}>()

const emit = defineEmits<{
  (e: 'updateUser', payload: {
    id: string
    name: string
    email: string
    role: 'user' | 'admin'
    password: string
  }): void
  (e: 'closeModal'): void
}>()

// Form ref
const form = ref<{
  name: string
  email: string
  role: 'user' | 'admin'
  password: string
}>({
  name: '',
  email: '',
  role: 'user',
  password: ''
})

// Sync data saat selectedUser berubah
watchEffect(() => {
  if (selectedUser) {
    form.value.name = selectedUser.name
    form.value.email = selectedUser.email
    form.value.role = selectedUser.role
  }
})

const updateUser = async () => {
  try {
    if (!selectedUser) return

    emit('updateUser', {
    id: selectedUser.id,
    ...form.value
    })
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

const closeModal = () => {
  emit('closeModal')
}
</script>

<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto relative">
      <button
        @click="closeModal"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>

      <h1 class="text-3xl font-bold mb-6">Edit User</h1>

      <form @submit.prevent="updateUser">
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
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Update User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
