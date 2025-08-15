<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateLead from '~/components/modal/CreateLead.vue'
import ModalEditLead from '~/components/modal/EditLead.vue'
import { useLeads } from '~/composables/crm/useLeads'
import { useToast } from '~/composables/utils/useToast'
import type { Lead, LeadCreateInput, LeadUpdatePayload } from '~/types/Lead'

const leads = ref<Lead[]>([])
const selectedLead = ref<Lead | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getLeads, getLeadById, createLead, updateLead, deleteLead } = useLeads()
const { addToast } = useToast()

const loadLeads = async () => {
  try {
    leads.value = await getLeads()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch leads', 'error')
  }
}

onMounted(loadLeads)

const handleCreateLead = async (leadData: LeadCreateInput) => {
  try {
    await createLead(leadData)
    await loadLeads()
    addToast('Lead created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create lead', 'error')
  }
}

const handleUpdateLead = async (id: string, updatedData: LeadUpdatePayload) => {
  try {
    await updateLead(id, updatedData)
    await loadLeads()
    addToast('Lead updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update lead', 'error')
  }
}

const fetchLeadById = async (id: string) => {
  try {
    selectedLead.value = await getLeadById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load lead data', 'error')
  }
}

const removeLead = async (id: string) => {
  try {
    await deleteLead(id)
    leads.value = leads.value.filter(l => l.id !== id)
    addToast('Lead deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete lead', 'error')
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
        Lead Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add Lead
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Phone</th>
            <th class="px-4 py-3 text-left">Company</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="lead in leads"
            :key="lead.id"
            class="hover:bg-gray-50 text-sm"
          >
            <td class="px-4 py-3 font-medium whitespace-nowrap">{{ lead.name }}</td>
            <td class="px-4 py-3">{{ lead.email || '-' }}</td>
            <td class="px-4 py-3">{{ lead.phone || '-' }}</td>
            <td class="px-4 py-3">{{ lead.company || '-' }}</td>
            <td class="px-4 py-3 capitalize">{{ lead.status }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchLeadById(lead.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeLead(lead.id)"
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
    <ModalCreateLead
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createLead="handleCreateLead"
    />

    <ModalEditLead
      :showModal="showEditModal"
      :selectedLead="selectedLead"
      @closeModal="showEditModal = false"
      @updateLead="(data) => selectedLead && handleUpdateLead(selectedLead.id, data)"
    />
  </div>
</template>
