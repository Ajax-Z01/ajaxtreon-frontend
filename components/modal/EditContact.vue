<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, FileEdit } from 'lucide-vue-next'
import type { ContactUpdatePayload } from '~/types/Contact'

const props = defineProps<{
  showModal: boolean
  selectedContact: (ContactUpdatePayload & { id: string }) | null
  leads: { id: string; name: string; company?: string }[]
}>()

const emit = defineEmits<{
  (e: 'updateContact', payload: ContactUpdatePayload & { id: string }): void
  (e: 'closeModal'): void
}>()

const form = ref<Required<ContactUpdatePayload>>({
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
  if (props.selectedContact) {
    form.value = {
      leadId: props.selectedContact.leadId || '',
      firstName: props.selectedContact.firstName || '',
      lastName: props.selectedContact.lastName || '',
      email: props.selectedContact.email || '',
      phone: props.selectedContact.phone || '',
      company: props.selectedContact.company || '',
      position: props.selectedContact.position || ''
    }
    errors.value = {}
  }
})

const updateContact = () => {
  if (!props.selectedContact) return

  errors.value = {}
  if (!form.value.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  }
  if (!form.value.leadId.trim()) {
    errors.value.leadId = 'Lead ID is required'
  }

  if (Object.keys(errors.value).length > 0) return

  emit('updateContact', {
    id: props.selectedContact.id,
    ...form.value
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
        <FileEdit class="w-6 h-6 text-green-600" />
        <h1 class="text-2xl font-bold text-gray-800">Edit Contact</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="updateContact" class="space-y-4">
        <!-- Lead (read-only) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lead</label>
          <p class="px-3 py-2 border rounded-lg bg-gray-100">
            {{
              props.leads.find(l => l.id === form.leadId)?.name
                ? `${props.leads.find(l => l.id === form.leadId)!.name} - ${props.leads.find(l => l.id === form.leadId)!.company || 'No Company'}`
                : 'Unknown Lead'
            }}
          </p>
        </div>

        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            v-model="form.firstName"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
          <p v-if="errors.firstName" class="text-sm text-red-600 mt-1">{{ errors.firstName }}</p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            v-model="form.lastName"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            v-model="form.phone"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- Company -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            v-model="form.company"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- Position -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            v-model="form.position"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- Submit -->
        <div class="pt-4 text-right">
          <button
            type="submit"
            class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Update Contact
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
