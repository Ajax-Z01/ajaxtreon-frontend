<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { validateUserInput } from '~/composables/useUserValidation'
import type { User, UserRole } from '~/types/User'
import { X, User as UserIcon, Mail, Phone, MapPin, Lock, ShieldCheck } from 'lucide-vue-next'

const errors = ref<Record<string, string>>({})

const { showModal, selectedUser } = defineProps<{
  showModal: boolean
  selectedUser: User | null
}>()

const emit = defineEmits<{
  (e: 'updateUser', payload: {
    id: string
    name: string
    email: string
    role: UserRole
    phone?: string
    address?: string
    password: string
  }): void
  (e: 'closeModal'): void
}>()

const form = ref({
  name: '',
  email: '',
  role: 'user' as UserRole,
  phone: '',
  address: '',
  password: ''
})

watchEffect(() => {
  if (selectedUser) {
    form.value.name = selectedUser.name
    form.value.email = selectedUser.email
    form.value.role = selectedUser.role
    form.value.phone = selectedUser.phone ?? ''
    form.value.address = selectedUser.address ?? ''
    form.value.password = ''
    errors.value = {}
  }
})

const updateUser = async () => {
  try {
    if (!selectedUser) return

    const validation = validateUserInput(form.value, { requirePassword: false })
    errors.value = validation.errors
    
    if (!validation.valid) {
      return
    }

    emit('updateUser', {
      id: selectedUser.id,
      name: form.value.name,
      email: form.value.email,
      role: form.value.role,
      phone: form.value.phone,
      address: form.value.address,
      password: form.value.password,
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
    class="fixed inset-0 bg-gray-700 bg-opacity-80 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative">
      <button
        @click="closeModal"
        aria-label="Close modal"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
      >
        <X class="w-6 h-6" />
      </button>

      <h1 class="text-3xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <UserIcon class="w-7 h-7 text-blue-600" />
        Edit User
      </h1>

      <form @submit.prevent="updateUser" class="space-y-5">
        <label
          for="name"
          class="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          <UserIcon class="w-4 h-4 text-blue-600" />
          Name
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>

        <label
          for="email"
          class="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          <Mail class="w-4 h-4 text-blue-600" />
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>

        <label
          for="phone"
          class="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          <Phone class="w-4 h-4 text-blue-600" />
          Phone
        </label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p v-if="errors.phone" class="text-xs text-red-600 mt-1">{{ errors.phone }}</p>

        <label
          for="address"
          class="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          <MapPin class="w-4 h-4 text-blue-600" />
          Address
        </label>
        <textarea
          id="address"
          v-model="form.address"
          rows="3"
          class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <p v-if="errors.address" class="text-xs text-red-600 mt-1">{{ errors.address }}</p>

        <label
          for="password"
          class="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          <Lock class="w-4 h-4 text-blue-600" />
          Password
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p v-if="errors.password" class="text-xs text-red-600 mt-1">{{ errors.password }}</p>

        <label
          for="role"
          class="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          <ShieldCheck class="w-4 h-4 text-blue-600" />
          Role
        </label>
        <select
          id="role"
          v-model="form.role"
          class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
        </select>
        <p v-if="errors.role" class="text-xs text-red-600 mt-1">{{ errors.role }}</p>

        <div class="text-right">
          <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Update User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
