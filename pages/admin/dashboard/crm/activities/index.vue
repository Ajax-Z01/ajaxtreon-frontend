<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useActivities } from '~/composables/crm/useActivities'
import type { Activity } from '~/types/Activity'

const { getAllActivities } = useActivities()
const activities = ref<Activity[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    activities.value = await getAllActivities()
  } catch (err: any) {
    error.value = err.message || 'Failed to load activities'
  } finally {
    loading.value = false
  }
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Activities</h1>
    <p class="text-gray-500 mb-6">List of CRM activities like meetings, calls, and follow-ups.</p>

    <div v-if="loading" class="text-gray-500">Loading activities...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Title</th>
            <th class="px-4 py-2 text-left">Type</th>
            <th class="px-4 py-2 text-left">Status</th>
            <th class="px-4 py-2 text-left">Due Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id" class="border-t">
            <td class="px-4 py-2">{{ activity.title }}</td>
            <td class="px-4 py-2 capitalize">{{ activity.type }}</td>
            <td class="px-4 py-2">{{ activity.status }}</td>
            <td class="px-4 py-2">{{ formatDate(activity.dueDate) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="activities.length === 0" class="text-gray-500 mt-4">
        No activities found.
      </div>
    </div>
  </div>
</template>
