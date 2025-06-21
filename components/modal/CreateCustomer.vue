<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { validateCustomerInput } from '~/composables/useCustomerValidation'
import { X, UserPlus } from 'lucide-vue-next'

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
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-xl relative border border-gray-200">
      <!-- Close Button -->
      <button
        @click="closeModal"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        aria-label="Close"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Title -->
      <div class="flex items-center gap-2 mb-6">
        <UserPlus class="w-6 h-6 text-green-600" />
        <h1 class="text-2xl font-bold text-gray-800">Create New Customer</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="createNewCustomer" class="space-y-5">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
            required
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0812xxxxxxx"
          />
        </div>

        <!-- Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
          <textarea
            v-model="form.address"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Jl. Merdeka No. 123"
          ></textarea>
        </div>

        <!-- Submit -->
        <div class="text-right">
          <button
            type="submit"
            class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            <UserPlus class="w-5 h-5" />
            Create Customer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
