<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { validateSellerInput } from '~/composables/seller/useSellerValidation'
import { X, UserPlus } from 'lucide-vue-next'

const errors = ref<Record<string, string>>({})

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createSeller', payload: {
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

const createNewSeller = async () => {
  try {
    const validation = validateSellerInput(form.value)
    errors.value = validation.errors
    if (!validation.valid) return

    emit('createSeller', {
      name: form.value.name,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
    })
  } catch (error) {
    console.error('Error creating seller:', error)
  }
}

const closeModal = () => {
  emit('closeModal')
}
</script>

<template>
  <div
    v-if="props.showModal"
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4"
  >
    <div class="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative border border-gray-200">
      <!-- Close button -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Title -->
      <div class="flex items-center gap-2 mb-6">
        <UserPlus class="w-6 h-6 text-green-600" />
        <h2 class="text-2xl font-bold text-gray-800">Create New Seller</h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="createNewSeller" class="space-y-4">
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
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Address (optional)</label>
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          ></textarea>
        </div>

        <!-- Submit button -->
        <div class="text-right pt-2">
          <button
            type="submit"
            class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Create Seller
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
