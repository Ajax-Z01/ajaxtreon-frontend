<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { validateSupplierInput } from '~/composables/useSupplierValidation'
import { X, Factory } from 'lucide-vue-next'

const errors = ref<Record<string, string>>({})

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createSupplier', payload: {
    name: string
    email?: string
    phone?: string
    address?: string
    contactPerson?: string
  }): void
  (e: 'closeModal'): void
}>()

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
})

watchEffect(() => {
  if (props.showModal) {
    form.value = {
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
    }
    errors.value = {}
  }
})

const createSupplier = () => {
  const validation = validateSupplierInput(form.value)
  errors.value = validation.errors
  if (!validation.valid) {
    return
  }
  
  emit('createSupplier', {
    name: form.value.name,
    email: form.value.email || undefined,
    phone: form.value.phone || undefined,
    address: form.value.address || undefined,
    contactPerson: form.value.contactPerson || undefined,
  })
}

const closeModal = () => {
  emit('closeModal')
}
</script>

<template>
  <div
    v-if="showModal"
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
        <Factory class="w-6 h-6 text-green-600" />
        <h1 class="text-2xl font-bold text-gray-800">Create New Supplier</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="createSupplier" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Email (optional)</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Phone (optional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <p v-if="errors.phone" class="text-sm text-red-600 mt-1">{{ errors.phone }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Address (optional)</label>
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          ></textarea>
          <p v-if="errors.address" class="text-sm text-red-600 mt-1">{{ errors.address }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Contact Person (optional)</label>
          <input
            v-model="form.contactPerson"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <p v-if="errors.contactPerson" class="text-sm text-red-600 mt-1">{{ errors.contactPerson }}</p>
        </div>

        <div class="pt-4 text-right">
          <button
            type="submit"
            class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Create Supplier
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
