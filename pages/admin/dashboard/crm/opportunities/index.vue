<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateOpportunity from '~/components/modal/CreateOpportunity.vue'
import ModalEditOpportunity from '~/components/modal/EditOpportunity.vue'
import { useOpportunities } from '~/composables/crm/useOpportunities'
import { useLeads } from '~/composables/crm/useLeads'
import { useToast } from '~/composables/utils/useToast'
import type { Opportunity, OpportunityCreateInput, OpportunityUpdatePayload } from '~/types/Opportunity'
import type { Lead } from '~/types/Lead'

const opportunities = ref<Opportunity[]>([])
const leads = ref<Lead[]>([])
const selectedOpportunity = ref<Opportunity | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getOpportunities, getOpportunityById, createOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities()
const { getLeads } = useLeads()
const { addToast } = useToast()

// Load all leads
const loadLeads = async () => {
  try {
    leads.value = await getLeads()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch leads', 'error')
  }
}

// Load opportunities
const loadOpportunities = async () => {
  try {
    opportunities.value = await getOpportunities()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch opportunities', 'error')
  }
}

// Get Lead Label from leadId
const getLeadLabel = (leadId: string) => {
  const lead = leads.value.find(l => l.id === leadId)
  return lead ? `${lead.name} - ${lead.company || 'No Company'}` : 'Unknown Lead'
}

onMounted(async () => {
  await loadLeads()
  await loadOpportunities()
})

const handleCreateOpportunity = async (data: OpportunityCreateInput) => {
  try {
    await createOpportunity(data)
    await loadOpportunities()
    addToast('Opportunity created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create opportunity', 'error')
  }
}

const handleUpdateOpportunity = async (id: string, data: OpportunityUpdatePayload) => {
  try {
    await updateOpportunity(id, data)
    await loadOpportunities()
    addToast('Opportunity updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update opportunity', 'error')
  }
}

const fetchOpportunityById = async (id: string) => {
  try {
    selectedOpportunity.value = await getOpportunityById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load opportunity data', 'error')
  }
}

const removeOpportunity = async (id: string) => {
  try {
    await deleteOpportunity(id)
    opportunities.value = opportunities.value.filter(o => o.id !== id)
    addToast('Opportunity deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete opportunity', 'error')
  }
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
        Opportunity Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add Opportunity
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">Lead</th>
            <th class="px-4 py-3 text-left">Value</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Close Date</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="opportunity in opportunities"
            :key="opportunity.id"
            class="hover:bg-gray-50 text-sm"
          >
            <td class="px-4 py-3 font-medium whitespace-nowrap">{{ opportunity.title }}</td>
            <td class="px-4 py-3">{{ getLeadLabel(opportunity.leadId) }}</td>
            <td class="px-4 py-3">${{ opportunity.value.toLocaleString() }}</td>
            <td class="px-4 py-3 capitalize">{{ opportunity.status }}</td>
            <td class="px-4 py-3">{{ opportunity.closeDate || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchOpportunityById(opportunity.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeOpportunity(opportunity.id)"
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
    <ModalCreateOpportunity
      :showModal="showCreateModal"
      :leads="leads"
      @closeModal="showCreateModal = false"
      @createOpportunity="handleCreateOpportunity"
    />

    <ModalEditOpportunity
      :showModal="showEditModal"
      :selectedOpportunity="selectedOpportunity"
      :leads="leads"
      @closeModal="showEditModal = false"
      @updateOpportunity="(data) => selectedOpportunity && handleUpdateOpportunity(selectedOpportunity.id, data)"
    />
  </div>
</template>
