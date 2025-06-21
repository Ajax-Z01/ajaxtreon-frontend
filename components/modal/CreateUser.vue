<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { validateUserInput } from '~/composables/useUserValidation'
import { UserPlus, X } from 'lucide-vue-next'

const errors = ref<Record<string, string>>({})

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createUser', payload: {
    name: string
    email: string
    password: string
    role: 'admin' | 'user' | 'staff' | 'manager'
    phone?: string
    address?: string
  }): void
  (e: 'closeModal'): void
}>()

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'user' as 'admin' | 'user' | 'staff' | 'manager',
  phone: '',
  address: '',
})

watchEffect(() => {
  if (props.showModal) {
    form.value = {
      name: '',
      email: '',
      password: '',
      role: 'user',
      phone: '',
      address: '',
    }
    errors.value = {}
  }
})

const createNewUser = async () => {
  try {
    const validation = validateUserInput(form.value, { requirePassword: true })
    errors.value = validation.errors
    if (!validation.valid) return

    emit('createUser', {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
    })
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
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl relative border border-gray-200">
      <!-- Close Button -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Title -->
      <div class="flex items-center gap-2 mb-6">
        <UserPlus class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-800">Create New User</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="createNewUser" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p v-if="errors.password" class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            v-model="form.role"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
          <p v-if="errors.role" class="text-sm text-red-600 mt-1">{{ errors.role }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </div>

        <div class="text-right pt-4">
          <button
            type="submit"
            class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
