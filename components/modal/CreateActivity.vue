<script setup lang="ts">
import { ref, watchEffect, onMounted, computed } from 'vue'
import { X, PlusCircle } from 'lucide-vue-next'
import type { ActivityType, ActivityStatus, ActivityCreateInput } from '~/types/Activity'
import { useLeads } from '~/composables/crm/useLeads'
import { useContacts } from '~/composables/crm/useContacts'
import { useOpportunities } from '~/composables/crm/useOpportunities'
import { useCRMUsers } from '~/composables/crm/useCRMUsers'

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createActivity', payload: ActivityCreateInput): void
  (e: 'closeModal'): void
}>()

// Form state
const form = ref<ActivityCreateInput>({
  title: '',
  description: '',
  type: 'call',
  status: 'pending',
  relatedTo: { type: 'lead', id: '' },
  assignedTo: '',
  dueDate: '',
  completedAt: ''
})

const errors = ref<Record<string, string>>({})

// Static options
const activityTypes: ActivityType[] = ['call','meeting','email','task','follow-up','note','reminder']
const activityStatuses: ActivityStatus[] = ['pending','completed','cancelled']

// Options fetched from API
const leadOptions = ref<{ id: string; name: string }[]>([])
const contactOptions = ref<{ id: string; name: string }[]>([])
const opportunityOptions = ref<{ id: string; name: string }[]>([])
const userOptions = ref<{ id: string; name: string }[]>([])

const { getLeads } = useLeads()
const { getContacts } = useContacts()
const { getOpportunities } = useOpportunities()
const { getCRMUsers } = useCRMUsers()

// Fetch options
const loadOptions = async () => {
  leadOptions.value = (await getLeads()).map(l => ({ id: l.id, name: l.name }))
  contactOptions.value = (await getContacts()).map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName || ''}` }))
  opportunityOptions.value = (await getOpportunities()).map(o => ({ id: o.id, name: o.title }))
  userOptions.value = (await getCRMUsers()).map(u => ({ id: u.id, name: u.name }))
}

// Reset form on modal open
watchEffect(() => {
  if (props.showModal) {
    form.value = {
      title: '',
      description: '',
      type: 'call',
      status: 'pending',
      relatedTo: { type: 'lead', id: '' },
      assignedTo: '',
      dueDate: '',
      completedAt: ''
    }
    errors.value = {}
    loadOptions()
  }
})

// Computed for dynamic related options
const relatedOptions = computed(() => {
  if (form.value.relatedTo.type === 'lead') return leadOptions.value
  if (form.value.relatedTo.type === 'contact') return contactOptions.value
  if (form.value.relatedTo.type === 'opportunity') return opportunityOptions.value
  return []
})

// Handlers
const createNewActivity = () => {
  errors.value = {}

  if (!form.value.title.trim()) errors.value.title = 'Title is required'
  if (!form.value.relatedTo.id) errors.value.relatedTo = 'Related record is required'

  if (Object.keys(errors.value).length > 0) return

  emit('createActivity', { ...form.value })
}

const closeModal = () => emit('closeModal')
</script>

<template>
  <div
    v-if="props.showModal"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl relative border border-gray-200 p-6 md:p-8">
      <!-- Close -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        aria-label="Close"
      >
        <X class="w-5 h-5"/>
      </button>

      <!-- Header -->
      <div class="flex items-center gap-2 mb-6">
        <PlusCircle class="w-6 h-6 text-blue-600"/>
        <h2 class="text-xl font-bold text-gray-800">Create New Activity</h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="createNewActivity" class="space-y-4">

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Follow up with client"
          />
          <p v-if="errors.title" class="text-sm text-red-600 mt-1">{{ errors.title }}</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Details about the activity..."
          />
        </div>

        <!-- Type & Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="form.type" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option v-for="t in activityTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option v-for="s in activityStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Related To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Related To <span class="text-red-500">*</span></label>
          <div class="flex gap-3">
            <select
              v-model="form.relatedTo.type"
              class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="lead">Lead</option>
              <option value="contact">Contact</option>
              <option value="opportunity">Opportunity</option>
            </select>
            <select
              v-model="form.relatedTo.id"
              class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select record</option>
              <option v-for="r in relatedOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
          <p v-if="errors.relatedTo" class="text-sm text-red-600 mt-1">{{ errors.relatedTo }}</p>
        </div>

        <!-- Assigned To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select v-model="form.assignedTo" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Unassigned</option>
            <option v-for="u in userOptions" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input v-model="form.dueDate" type="date" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Completed At</label>
            <input v-model="form.completedAt" type="date" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>

        <!-- Submit -->
        <div class="text-right">
          <button type="submit" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition">
            <PlusCircle class="w-5 h-5"/> Create Activity
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
