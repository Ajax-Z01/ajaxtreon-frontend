<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { validateCustomerInput } from '~/composables/useCustomerValidation'

const errors = ref<Record<string, string>>({})

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createCustomer', payload: {
    name: string
    email?: string
    phone?: string
    address?: string
  }): void
  (e: 'closeModal'): void
}>()

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
})

watchEffect(() => {
  if (props.showModal) {
    form.value = {
      name: '',
      email: '',
      phone: '',
      address: '',
    }
    errors.value = {}
  }
})

const createNewCustomer = async () => {
  try {
    const validation = validateCustomerInput(form.value)
    errors.value = validation.errors
    if (!validation.valid) return

    emit('createCustomer', {
      name: form.value.name,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
    })
  } catch (error) {
    console.error('Error creating customer:', error)
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

      <h1 class="text-2xl font-bold mb-6">Create New Customer</h1>

      <form @submit.prevent="createNewCustomer">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email (optional)</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Phone (optional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Address (optional)</label>
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="text-right">
          <button
            type="submit"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Customer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
