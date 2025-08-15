<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalCreateContact from '~/components/modal/CreateContact.vue'
import ModalEditContact from '~/components/modal/EditContact.vue'
import { useContacts } from '~/composables/crm/useContacts'
import { useToast } from '~/composables/utils/useToast'
import type { Contact, ContactCreateInput, ContactUpdatePayload } from '~/types/Contact'

const contacts = ref<Contact[]>([])
const selectedContact = ref<Contact | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { getContacts, getContactById, createContact, updateContact, deleteContact } = useContacts()
const { addToast } = useToast()

const loadContacts = async () => {
  try {
    contacts.value = await getContacts()
  } catch (error) {
    console.error(error)
    addToast('Failed to fetch contacts', 'error')
  }
}

onMounted(loadContacts)

const handleCreateContact = async (contactData: ContactCreateInput) => {
  try {
    await createContact(contactData)
    await loadContacts()
    addToast('Contact created successfully', 'success')
    showCreateModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to create contact', 'error')
  }
}

const handleUpdateContact = async (id: string, updatedData: ContactUpdatePayload) => {
  try {
    await updateContact(id, updatedData)
    await loadContacts()
    addToast('Contact updated successfully', 'success')
    showEditModal.value = false
  } catch (error) {
    console.error(error)
    addToast('Failed to update contact', 'error')
  }
}

const fetchContactById = async (id: string) => {
  try {
    selectedContact.value = await getContactById(id)
    showEditModal.value = true
  } catch (error) {
    console.error(error)
    addToast('Failed to load contact data', 'error')
  }
}

const removeContact = async (id: string) => {
  try {
    await deleteContact(id)
    contacts.value = contacts.value.filter(c => c.id !== id)
    addToast('Contact deleted successfully', 'success')
  } catch (error) {
    console.error(error)
    addToast('Failed to delete contact', 'error')
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
        Contact Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        + Add Contact
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
            <th class="px-4 py-3 text-left">Position</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="contact in contacts"
            :key="contact.id"
            class="hover:bg-gray-50 text-sm"
          >
            <td class="px-4 py-3 font-medium whitespace-nowrap">
              {{ contact.firstName }} {{ contact.lastName || '' }}
            </td>
            <td class="px-4 py-3">{{ contact.email || '-' }}</td>
            <td class="px-4 py-3">{{ contact.phone || '-' }}</td>
            <td class="px-4 py-3">{{ contact.company || '-' }}</td>
            <td class="px-4 py-3">{{ contact.position || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  @click="fetchContactById(contact.id)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="removeContact(contact.id)"
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
    <ModalCreateContact
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createContact="handleCreateContact"
    />

    <ModalEditContact
      :showModal="showEditModal"
      :selectedContact="selectedContact"
      @closeModal="showEditModal = false"
      @updateContact="(data) => selectedContact && handleUpdateContact(selectedContact.id, data)"
    />
  </div>
</template>
