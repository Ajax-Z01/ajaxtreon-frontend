<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, PlusCircle } from 'lucide-vue-next'
import type { ContactCreateInput } from '~/types/Contact'

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createContact', payload: ContactCreateInput): void
  (e: 'closeModal'): void
}>()

const form = ref<ContactCreateInput>({
  leadId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  position: ''
})

const errors = ref<Record<string, string>>({})

watchEffect(() => {
  if (props.showModal) {
    form.value = {
      leadId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: ''
    }
    errors.value = {}
  }
})

const createNewContact = () => {
  errors.value = {}

  if (!form.value.firstName) {
    errors.value.firstName = 'First name is required'
  }
  if (!form.value.leadId) {
    errors.value.leadId = 'Lead ID is required'
  }

  if (Object.keys(errors.value).length > 0) return

  emit('createContact', { ...form.value })
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
    <div
      class="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl relative border border-gray-200"
    >
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
        <PlusCircle class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-800">Create New Contact</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="createNewContact" class="space-y-5">
        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.firstName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John"
          />
          <p v-if="errors.firstName" class="text-sm text-red-600 mt-1">
            {{ errors.firstName }}
          </p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            v-model="form.lastName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Doe"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="johndoe@example.com"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            v-model="form.phone"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+62 812-3456-7890"
          />
        </div>

        <!-- Company -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            v-model="form.company"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="PT Example"
          />
        </div>

        <!-- Position -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            v-model="form.position"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Manager"
          />
        </div>

        <!-- Lead ID -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Lead ID <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.leadId"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="leadId123"
          />
          <p v-if="errors.leadId" class="text-sm text-red-600 mt-1">
            {{ errors.leadId }}
          </p>
        </div>

        <!-- Submit -->
        <div class="text-right">
          <button
            type="submit"
            class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            <PlusCircle class="w-5 h-5" />
            Create Contact
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
