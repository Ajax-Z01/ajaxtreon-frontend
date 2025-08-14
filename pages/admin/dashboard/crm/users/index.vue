<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCRMUsers } from '~/composables/crm/useCRMUsers'
import type { CRMUser } from '~/types/CRMUser'

const { getCRMUsers } = useCRMUsers()
const users = ref<CRMUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString() : '-'

onMounted(async () => {
  try {
    users.value = await getCRMUsers()
  } catch (err: any) {
    error.value = err.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">CRM Users</h1>
    <p class="text-gray-500 mb-6">Manage CRM users and their roles.</p>

    <div v-if="loading" class="text-gray-500">Loading users...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Email</th>
            <th class="px-4 py-2 text-left">Role</th>
            <th class="px-4 py-2 text-left">Created At</th>
            <th class="px-4 py-2 text-left">Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t">
            <td class="px-4 py-2">{{ user.name }}</td>
            <td class="px-4 py-2">{{ user.email || '-' }}</td>
            <td class="px-4 py-2">{{ user.role || '-' }}</td>
            <td class="px-4 py-2">{{ formatDate(user.createdAt) }}</td>
            <td class="px-4 py-2">{{ formatDate(user.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="text-gray-500 mt-4">
        No CRM users found.
      </div>
    </div>
  </div>
</template>
