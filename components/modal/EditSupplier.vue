<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, User, Mail, Phone, MapPin, UserCheck } from 'lucide-vue-next'
import { validateSupplierInput } from '~/composables/supplier/useSupplierValidation'

const errors = ref<Record<string, string>>({})

const props = defineProps<{
  showModal: boolean
  selectedSupplier: {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'updateSupplier', payload: {
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
  if (props.selectedSupplier) {
    form.value.name = props.selectedSupplier.name
    form.value.email = props.selectedSupplier.email ?? ''
    form.value.phone = props.selectedSupplier.phone ?? ''
    form.value.address = props.selectedSupplier.address ?? ''
    errors.value = {}
  }
})

const updateSupplier = () => {
  if (!props.selectedSupplier) return

  const validation = validateSupplierInput(form.value)
  errors.value = validation.errors
  if (!validation.valid) return

  emit('updateSupplier', {
    id: props.selectedSupplier.id,
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
    class="fixed inset-0 bg-gray-700 bg-opacity-80 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
      <button
        @click="closeModal"
        aria-label="Close modal"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
      >
        <X class="w-6 h-6" />
      </button>

      <h1 class="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <User class="w-7 h-7 text-green-600" />
        Edit Supplier
      </h1>

      <form @submit.prevent="updateSupplier" class="space-y-5">
        <label class="text-sm font-medium text-gray-700" for="name">Name</label>
        <div class="relative">
          <User class="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-4 h-4 pointer-events-none" />
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="pl-9 w-full py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <label class="text-sm font-medium text-gray-700" for="email">Email (optional)</label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-4 h-4 pointer-events-none" />
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="pl-9 w-full py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <label class="text-sm font-medium text-gray-700" for="phone">Phone (optional)</label>
        <div class="relative">
          <Phone class="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-4 h-4 pointer-events-none" />
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="pl-9 w-full py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p v-if="errors.phone" class="text-xs text-red-600 mt-1">{{ errors.phone }}</p>
        </div>

        <label class="text-sm font-medium text-gray-700" for="address">Address (optional)</label>
        <div class="relative">
          <MapPin class="absolute left-3 top-3 text-green-600 w-4 h-4 pointer-events-none" />
          <textarea
            id="address"
            v-model="form.address"
            rows="3"
            class="pl-9 w-full py-2 border rounded shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          ></textarea>
          <p v-if="errors.address" class="text-xs text-red-600 mt-1">{{ errors.address }}</p>
        </div>

        <div class="text-right">
          <button
            type="submit"
            class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Update Supplier
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
