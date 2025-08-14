<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useContacts } from '~/composables/crm/useContacts'
import type { Contact } from '~/types/Contact'

const { getContacts } = useContacts()
const contacts = ref<Contact[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    contacts.value = await getContacts()
  } catch (err: any) {
    error.value = err.message || 'Failed to load contacts'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Contacts</h1>
    <p class="text-gray-500 mb-6">List of CRM contacts with their details.</p>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-500 animate-pulse">Loading contacts...</div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <!-- Data Table -->
    <div v-else>
      <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Email</th>
            <th class="px-4 py-2 text-left">Phone</th>
            <th class="px-4 py-2 text-left">Company</th>
            <th class="px-4 py-2 text-left">Position</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="contact in contacts"
            :key="contact.id"
            class="border-t hover:bg-gray-50 transition"
          >
            <td class="px-4 py-2">
              {{ contact.firstName }} {{ contact.lastName || '' }}
            </td>
            <td class="px-4 py-2">{{ contact.email || '-' }}</td>
            <td class="px-4 py-2">{{ contact.phone || '-' }}</td>
            <td class="px-4 py-2">{{ contact.company || '-' }}</td>
            <td class="px-4 py-2">{{ contact.position || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="contacts.length === 0" class="text-gray-500 mt-4">
        No contacts found.
      </div>
    </div>
  </div>
</template>
