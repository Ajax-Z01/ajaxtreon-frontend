<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, FileEdit } from 'lucide-vue-next'
import type { CRMUser, CRMUserUpdatePayload, CRMUserRole } from '~/types/CRMUser'

const roles: CRMUserRole[] = ['admin', 'staff', 'manager', 'sales', 'marketing', 'support']

const props = defineProps<{
  showModal: boolean
  selectedUser: CRMUser | null
}>()

const emit = defineEmits<{
  (e: 'updateUser', payload: CRMUserUpdatePayload): void
  (e: 'closeModal'): void
}>()

const form = ref<CRMUserUpdatePayload>({
  name: '',
  email: '',
  role: 'staff',
  isActive: true
})

const errors = ref<Record<string, string>>({})

watchEffect(() => {
  if (props.selectedUser) {
    form.value = {
      name: props.selectedUser.name,
      email: props.selectedUser.email,
      role: props.selectedUser.role,
      isActive: props.selectedUser.isActive
    }
    errors.value = {}
  }
})

const updateUserData = () => {
  if (!props.selectedUser) return
  errors.value = {}
  if (!form.value.name?.trim()) errors.value.name = 'Name is required'
  if (!form.value.email?.trim()) errors.value.email = 'Email is required'
  if (!form.value.role) errors.value.role = 'Role is required'

  if (Object.keys(errors.value).length > 0) return
  emit('updateUser', { ...form.value })
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
        <FileEdit class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-800">Edit CRM User</h1>
      </div>

      <form @submit.prevent="updateUserData" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input v-model="form.name" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="form.email" type="email" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select v-model="form.role" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
          <p v-if="errors.role" class="text-sm text-red-600 mt-1">{{ errors.role }}</p>
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="form.isActive" id="isActive" class="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <label for="isActive" class="text-sm text-gray-700">Active</label>
        </div>

        <div class="text-right pt-4">
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition">
            Update User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
