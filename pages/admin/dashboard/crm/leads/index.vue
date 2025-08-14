<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLeads } from '~/composables/crm/useLeads'
import type { Lead } from '~/types/Lead'

const { getLeads } = useLeads()
const leads = ref<Lead[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    leads.value = await getLeads()
  } catch (err: any) {
    error.value = err.message || 'Failed to load leads'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Leads</h1>
    <p class="text-gray-500 mb-6">List of CRM leads with their details.</p>

    <div v-if="loading" class="text-gray-500">Loading leads...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Email</th>
            <th class="px-4 py-2 text-left">Phone</th>
            <th class="px-4 py-2 text-left">Company</th>
            <th class="px-4 py-2 text-left">Status</th>
            <th class="px-4 py-2 text-left">Assigned To</th>
            <th class="px-4 py-2 text-left">Last Contacted</th>
            <th class="px-4 py-2 text-left">Created At</th>
            <th class="px-4 py-2 text-left">Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads" :key="lead.id" class="border-t">
            <td class="px-4 py-2">{{ lead.name }}</td>
            <td class="px-4 py-2">{{ lead.email || '-' }}</td>
            <td class="px-4 py-2">{{ lead.phone || '-' }}</td>
            <td class="px-4 py-2">{{ lead.company || '-' }}</td>
            <td class="px-4 py-2 capitalize">{{ lead.status }}</td>
            <td class="px-4 py-2">{{ lead.assignedTo || '-' }}</td>
            <td class="px-4 py-2">{{ lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : '-' }}</td>
            <td class="px-4 py-2">{{ new Date(lead.createdAt).toLocaleDateString() }}</td>
            <td class="px-4 py-2">{{ new Date(lead.updatedAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="leads.length === 0" class="text-gray-500 mt-4">
        No leads found.
      </div>
    </div>
  </div>
</template>
