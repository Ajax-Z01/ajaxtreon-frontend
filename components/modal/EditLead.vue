<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, FileEdit } from 'lucide-vue-next'
import type { Lead, LeadUpdatePayload, LeadStatus } from '~/types/Lead'

const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'lost', 'converted']

const props = defineProps<{
  showModal: boolean
  selectedLead: Lead | null
}>()

const emit = defineEmits<{
  (e: 'updateLead', payload: LeadUpdatePayload): void
  (e: 'closeModal'): void
}>()

const form = ref<LeadUpdatePayload>({
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'new',
  assignedTo: '',
  source: '',
  notes: '',
  lastContactedAt: '',
  expectedValue: undefined,
  tags: []
})

const errors = ref<Record<string, string>>({})

watchEffect(() => {
  if (props.selectedLead) {
    form.value = {
      name: props.selectedLead.name,
      email: props.selectedLead.email ?? '',
      phone: props.selectedLead.phone ?? '',
      company: props.selectedLead.company ?? '',
      status: props.selectedLead.status,
      assignedTo: props.selectedLead.assignedTo ?? '',
      source: props.selectedLead.source ?? '',
      notes: props.selectedLead.notes ?? '',
      lastContactedAt: props.selectedLead.lastContactedAt ?? '',
      expectedValue: props.selectedLead.expectedValue,
      tags: props.selectedLead.tags ?? []
    }
    errors.value = {}
  }
})

const updateLeadData = () => {
  if (!props.selectedLead) return
  errors.value = {}
  if (!form.value.name?.trim()) {
    errors.value.name = 'Name is required'
    return
  }
  emit('updateLead', { ...form.value })
}

const closeModal = () => emit('closeModal')
</script>

<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl relative border border-gray-200">
      <!-- Close -->
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <X class="w-5 h-5" />
      </button>

      <!-- Title -->
      <div class="flex items-center gap-2 mb-6">
        <FileEdit class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-800">Edit Lead</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="updateLeadData" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="text"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              v-model="form.company"
              type="text"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option v-for="s in leadStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </div>

        <div class="text-right pt-4">
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
          >
            Update Lead
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
