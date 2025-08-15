<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateActivity from '~/components/modal/CreateActivity.vue'
import ModalEditActivity from '~/components/modal/EditActivity.vue'
import { useActivities } from '~/composables/crm/useActivities'
import { useToast } from '~/composables/utils/useToast'
import type { Activity, ActivityCreateInput, ActivityUpdatePayload } from '~/types/Activity'

const activities = ref<Activity[]>([])
const selectedActivity = ref<Activity | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getAllActivities, getActivityById, createActivity, updateActivity, deleteActivity } = useActivities()
const { addToast } = useToast()

const loadActivities = async () => {
  try {
    activities.value = await getAllActivities()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch activities', 'error')
  }
}

onMounted(loadActivities)

const handleCreateActivity = async (activityData: ActivityCreateInput) => {
  try {
    await createActivity(activityData)
    await loadActivities()
    addToast('Activity created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create activity', 'error')
  }
}

const handleUpdateActivity = async (id: string, updatedData: ActivityUpdatePayload) => {
  try {
    await updateActivity(id, updatedData)
    await loadActivities()
    addToast('Activity updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update activity', 'error')
  }
}

const fetchActivityById = async (id: string) => {
  try {
    selectedActivity.value = await getActivityById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load activity data', 'error')
  }
}

const removeActivity = async (id: string) => {
  try {
    await deleteActivity(id)
    activities.value = activities.value.filter(a => a.id !== id)
    addToast('Activity deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete activity', 'error')
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <NuxtLink
        to="/admin/dashboard/crm"
        class="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition text-center md:text-left"
      >
        ← Back to Dashboard
      </NuxtLink>

      <h1 class="text-2xl md:text-3xl font-bold text-center md:text-left">
        Activity Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add Activity
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">Type</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Due Date</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="activity in activities"
            :key="activity.id"
            class="hover:bg-gray-50 text-sm"
          >
            <td class="px-4 py-3 font-medium whitespace-nowrap">
              {{ activity.title }}
            </td>
            <td class="px-4 py-3 capitalize">{{ activity.type }}</td>
            <td class="px-4 py-3">{{ activity.status }}</td>
            <td class="px-4 py-3">{{ formatDate(activity.dueDate) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchActivityById(activity.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeActivity(activity.id)"
                  class="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <ModalCreateActivity
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createActivity="handleCreateActivity"
    />

    <ModalEditActivity
      :showModal="showEditModal"
      :selectedActivity="selectedActivity"
      @closeModal="showEditModal = false"
      @updateActivity="(data) => selectedActivity && handleUpdateActivity(selectedActivity.id, data)"
    />
  </div>
</template>
