<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, PlusCircle } from 'lucide-vue-next'
import type { ActivityType, ActivityStatus, ActivityCreateInput } from '~/types/Activity'

const activityTypes: ActivityType[] = [
  'call',
  'meeting',
  'email',
  'task',
  'follow-up',
  'note',
  'reminder'
]

const activityStatuses: ActivityStatus[] = ['pending', 'completed', 'cancelled']

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'createActivity', payload: ActivityCreateInput): void
  (e: 'closeModal'): void
}>()

const form = ref<ActivityCreateInput>({
  title: '',
  description: '',
  type: 'call',
  status: 'pending',
  relatedTo: {
    type: 'lead',
    id: ''
  },
  assignedTo: '',
  dueDate: '',
  completedAt: ''
})

const errors = ref<Record<string, string>>({})

watchEffect(() => {
  if (props.showModal) {
    form.value = {
      title: '',
      description: '',
      type: 'call',
      status: 'pending',
      relatedTo: {
        type: 'lead',
        id: ''
      },
      assignedTo: '',
      dueDate: '',
      completedAt: ''
    }
    errors.value = {}
  }
})

const createNewActivity = () => {
  errors.value = {}

  if (!form.value.title) {
    errors.value.title = 'Title is required'
  }
  if (!form.value.relatedTo.id) {
    errors.value.relatedTo = 'Related record ID is required'
  }

  if (Object.keys(errors.value).length > 0) return

  emit('createActivity', { ...form.value })
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
    <div class="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl relative border border-gray-200">
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
        <h1 class="text-2xl font-bold text-gray-800">Create New Activity</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="createNewActivity" class="space-y-5">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Details about the activity..."
          ></textarea>
        </div>

        <!-- Type & Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="form.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="t in activityTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="s in activityStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Related To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Related To <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <select
              v-model="form.relatedTo.type"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lead">Lead</option>
              <option value="contact">Contact</option>
              <option value="opportunity">Opportunity</option>
            </select>
            <input
              v-model="form.relatedTo.id"
              type="text"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Related record ID"
            />
          </div>
          <p v-if="errors.relatedTo" class="text-sm text-red-600 mt-1">{{ errors.relatedTo }}</p>
        </div>

        <!-- Assigned To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To (User ID)</label>
          <input
            v-model="form.assignedTo"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="User ID"
          />
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            v-model="form.dueDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Completed At -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Completed At</label>
          <input
            v-model="form.completedAt"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Submit -->
        <div class="text-right">
          <button
            type="submit"
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            <PlusCircle class="w-5 h-5" />
            Create Activity
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
