<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { X, FileEdit } from 'lucide-vue-next'
import type { ActivityType, ActivityStatus } from '~/types/Activity'

const errors = ref<Record<string, string>>({})

const activityTypes: ActivityType[] = ['call', 'meeting', 'email', 'task', 'follow-up', 'note', 'reminder']
const activityStatuses: ActivityStatus[] = ['pending', 'completed', 'cancelled']

const props = defineProps<{
  showModal: boolean
  selectedActivity: {
    id: string
    title: string
    description?: string
    type: ActivityType
    status: ActivityStatus
    relatedTo: {
      type: 'lead' | 'contact' | 'opportunity'
      name: string
    }
    assignedTo?: string
    dueDate?: string
    completedAt?: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'updateActivity', payload: {
    id: string
    title?: string
    description?: string
    type?: ActivityType
    status?: ActivityStatus
    dueDate?: string
    completedAt?: string
  }): void
  (e: 'closeModal'): void
}>()

const form = ref({
  title: '',
  description: '',
  type: 'call' as ActivityType,
  status: 'pending' as ActivityStatus,
  dueDate: '',
  completedAt: ''
})

watchEffect(() => {
  if (props.selectedActivity) {
    form.value = {
      title: props.selectedActivity.title,
      description: props.selectedActivity.description ?? '',
      type: props.selectedActivity.type,
      status: props.selectedActivity.status,
      dueDate: props.selectedActivity.dueDate ?? '',
      completedAt: props.selectedActivity.completedAt ?? ''
    }
    errors.value = {}
  }
})

const updateActivity = () => {
  if (!props.selectedActivity) return
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
    return
  }
  errors.value = {}

  emit('updateActivity', {
    id: props.selectedActivity.id,
    title: form.value.title,
    description: form.value.description || undefined,
    type: form.value.type,
    status: form.value.status,
    dueDate: form.value.dueDate || undefined,
    completedAt: form.value.completedAt || undefined
  })
}

const closeModal = () => emit('closeModal')
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
    <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl relative border border-gray-200">
      <!-- Close Button -->
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close">
        <X class="w-5 h-5" />
      </button>

      <!-- Title -->
      <div class="flex items-center gap-2 mb-6">
        <FileEdit class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-800">Edit Activity</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="updateActivity" class="space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input v-model="form.title" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <p v-if="errors.title" class="text-sm text-red-600 mt-1">{{ errors.title }}</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <!-- Type & Status -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select v-model="form.type" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option v-for="t in activityTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select v-model="form.status" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option v-for="s in activityStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Related To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Related To</label>
          <input type="text" :value="selectedActivity?.relatedTo.name" disabled class="w-full px-3 py-2 border rounded-lg bg-gray-100" />
        </div>

        <!-- Assigned To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <input type="text" :value="selectedActivity?.assignedTo" disabled class="w-full px-3 py-2 border rounded-lg bg-gray-100" />
        </div>

        <!-- Due Date & Completed At -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input v-model="form.dueDate" type="date" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Completed At</label>
            <input v-model="form.completedAt" type="date" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
          </div>
        </div>

        <!-- Submit -->
        <div class="pt-4 text-right">
          <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Update Activity</button>
        </div>
      </form>
    </div>
  </div>
</template>
