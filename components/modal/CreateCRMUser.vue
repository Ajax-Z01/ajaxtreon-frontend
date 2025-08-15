<script setup lang="ts">
import { ref } from 'vue'
import { X, UserPlus } from 'lucide-vue-next'
import type { CRMUserCreateInput, CRMUserRole } from '~/types/CRMUser'

const roles: CRMUserRole[] = ['admin', 'staff', 'manager', 'sales', 'marketing', 'support']

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createUser', payload: CRMUserCreateInput): void
  (e: 'closeModal'): void
}>()

const form = ref<CRMUserCreateInput>({
  email: '',
  name: '',
  role: 'staff',
  isActive: true
})

const errors = ref<Record<string, string>>({})

const createUser = () => {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Name is required'
  if (!form.value.email.trim()) errors.value.email = 'Email is required'
  if (!form.value.role) errors.value.role = 'Role is required'

  if (Object.keys(errors.value).length > 0) return
  emit('createUser', { ...form.value })
}

const closeModal = () => emit('closeModal')
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
    <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative border border-gray-200">
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <X class="w-5 h-5" />
      </button>

      <div class="flex items-center gap-2 mb-6">
        <UserPlus class="w-6 h-6 text-green-600" />
        <h1 class="text-2xl font-bold text-gray-800">Add CRM User</h1>
      </div>

      <form @submit.prevent="createUser" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input v-model="form.name" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="form.email" type="email" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select v-model="form.role" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
          <p v-if="errors.role" class="text-sm text-red-600 mt-1">{{ errors.role }}</p>
        </div>

        <div class="text-right pt-4">
          <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition">
            Add User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
