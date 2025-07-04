<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { validateSellerInput } from '~/composables/useSellerValidation'

const errors = ref<Record<string, string>>({})

const props = defineProps<{
  showModal: boolean
  selectedSeller: {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'updateSeller', payload: {
    id: string
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
  if (props.selectedSeller) {
    form.value.name = props.selectedSeller.name
    form.value.email = props.selectedSeller.email ?? ''
    form.value.phone = props.selectedSeller.phone ?? ''
    form.value.address = props.selectedSeller.address ?? ''
    errors.value = {}
  }
})

const updateSeller = () => {
  if (!props.selectedSeller) return

  const validation = validateSellerInput(form.value)
  errors.value = validation.errors
  if (!validation.valid) {
    return
  }

  emit('updateSeller', {
    id: props.selectedSeller.id,
    name: form.value.name,
    email: form.value.email || undefined,
    phone: form.value.phone || undefined,
    address: form.value.address || undefined,
  })
}

const closeModal = () => {
  emit('closeModal')
}
</script>

<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-white p-6 rounded-lg shadow-md max-w-xl w-full relative">
      <button
        @click="closeModal"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none"
        aria-label="Close modal"
      >
        &times;
      </button>

      <h1 class="text-3xl font-bold mb-6">Edit Seller</h1>

      <form @submit.prevent="updateSeller" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email (optional)</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Phone (optional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.phone" class="text-sm text-red-600 mt-1">{{ errors.phone }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Address (optional)</label>
          <textarea
            v-model="form.address"
            class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
          <p v-if="errors.address" class="text-sm text-red-600 mt-1">{{ errors.address }}</p>
        </div>

        <div class="text-right">
          <button
            type="submit"
            class="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
          >
            Update Seller
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
