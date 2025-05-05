<script setup lang="ts">
import { ref, watchEffect, defineProps, defineEmits } from 'vue'

// Props definition
const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createUser', payload: {
    name: string
    email: string
    password: string
    role: 'user' | 'admin'
  }): void
  (e: 'closeModal'): void
}>()

// Reactive form state
const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'user' as 'user' | 'admin'
})

// Reset form every time modal opens
watchEffect(() => {
  if (props.showModal) {
    form.value = {
      name: '',
      email: '',
      password: '',
      role: 'user'
    }
  }
})

// Emit create event
const createNewUser = async () => {
  try {
    emit('createUser', { ...form.value })
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

const closeModal = () => {
  emit('closeModal')
}
</script>

<template>
  <div
    v-if="props.showModal"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto relative">
      <button
        @click="closeModal"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>

      <h1 class="text-3xl font-bold mb-6">Create New User</h1>

      <form @submit.prevent="createNewUser">
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
