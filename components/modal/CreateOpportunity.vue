<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, PlusCircle } from 'lucide-vue-next'
import type { OpportunityCreateInput, OpportunityStatus } from '~/types/Opportunity'

const opportunityStatuses: OpportunityStatus[] = ['open', 'won', 'lost']

const props = defineProps<{ showModal: boolean }>()
const emit = defineEmits<{
  (e: 'createOpportunity', payload: OpportunityCreateInput): void
  (e: 'closeModal'): void
}>()

const form = ref<OpportunityCreateInput>({
  leadId: '',
  title: '',
  value: 0,
  status: 'open',
  closeDate: ''
})

const errors = ref<Record<string, string>>({})

watchEffect(() => {
  if (props.showModal) {
    form.value = { leadId: '', title: '', value: 0, status: 'open', closeDate: '' }
    errors.value = {}
  }
})

const createNewOpportunity = () => {
  errors.value = {}
  if (!form.value.leadId.trim()) errors.value.leadId = 'Lead ID is required'
  if (!form.value.title.trim()) errors.value.title = 'Title is required'
  if (form.value.value <= 0) errors.value.value = 'Value must be greater than 0'

  if (Object.keys(errors.value).length > 0) return
  emit('createOpportunity', { ...form.value })
}

const closeModal = () => emit('closeModal')
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
    <div class="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-xl relative border border-gray-200">
      <button @click="closeModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
        <X class="w-5 h-5" />
      </button>

      <div class="flex items-center gap-2 mb-6">
        <PlusCircle class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-800">Create Opportunity</h1>
      </div>

      <form @submit.prevent="createNewOpportunity" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lead ID *</label>
          <input v-model="form.leadId" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <p v-if="errors.leadId" class="text-sm text-red-600 mt-1">{{ errors.leadId }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input v-model="form.title" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <p v-if="errors.title" class="text-sm text-red-600 mt-1">{{ errors.title }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Value *</label>
          <input v-model.number="form.value" type="number" min="0" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <p v-if="errors.value" class="text-sm text-red-600 mt-1">{{ errors.value }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="form.status" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option v-for="s in opportunityStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
          <input v-model="form.closeDate" type="date" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div class="text-right pt-4">
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition">
            Create Opportunity
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
