<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useOpportunities } from '~/composables/crm/useOpportunities'
import type { Opportunity } from '~/types/Opportunity'

const { getOpportunities } = useOpportunities()
const opportunities = ref<Opportunity[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    opportunities.value = await getOpportunities()
  } catch (err: any) {
    error.value = err.message || 'Failed to load opportunities'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Opportunities</h1>
    <p class="text-gray-500 mb-6">List of CRM opportunities with details.</p>

    <div v-if="loading" class="text-gray-500">Loading opportunities...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Title</th>
            <th class="px-4 py-2 text-left">Lead ID</th>
            <th class="px-4 py-2 text-left">Value</th>
            <th class="px-4 py-2 text-left">Status</th>
            <th class="px-4 py-2 text-left">Close Date</th>
            <th class="px-4 py-2 text-left">Created At</th>
            <th class="px-4 py-2 text-left">Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="opp in opportunities" :key="opp.id" class="border-t">
            <td class="px-4 py-2">{{ opp.title }}</td>
            <td class="px-4 py-2">{{ opp.leadId }}</td>
            <td class="px-4 py-2">{{ opp.value.toLocaleString() }}</td>
            <td class="px-4 py-2 capitalize">{{ opp.status }}</td>
            <td class="px-4 py-2">{{ opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : '-' }}</td>
            <td class="px-4 py-2">{{ new Date(opp.createdAt).toLocaleDateString() }}</td>
            <td class="px-4 py-2">{{ new Date(opp.updatedAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="opportunities.length === 0" class="text-gray-500 mt-4">
        No opportunities found.
      </div>
    </div>
  </div>
</template>
