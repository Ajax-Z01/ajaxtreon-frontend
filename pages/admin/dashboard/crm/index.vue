<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/auth/useAuth'

const router = useRouter()
const { logout } = useAuth()

const logoutUser = async () => {
  await logout()
  router.push('/auth/login')
}

const crmCards = [
  {
    title: 'Activities',
    description: 'Track meetings, calls, and follow-ups.',
    to: '/admin/dashboard/crm/activities'
  },
  {
    title: 'Contacts',
    description: 'Manage customer and partner information.',
    to: '/admin/dashboard/crm/contacts'
  },
  {
    title: 'Leads',
    description: 'Monitor potential clients and prospects.',
    to: '/admin/dashboard/crm/leads'
  },
  {
    title: 'Opportunities',
    description: 'Track sales opportunities and deals.',
    to: '/admin/dashboard/crm/opportunities'
  }
]
</script>

<template>
  <div class="p-4 sm:p-8 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-center justify-between flex-wrap mb-6 gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold">CRM Dashboard</h1>
      <button
        @click="logoutUser"
        class="bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 transition w-full sm:w-auto text-center"
      >
        Logout
      </button>
    </div>

    <!-- CRM Modules Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Leads Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Leads Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage potential customers and track lead sources.</p>
        <router-link to="/admin/dashboard/crm/leads" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Leads →
        </router-link>
      </div>

      <!-- Contacts Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Contacts Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage customer contact information and details.</p>
        <router-link to="/admin/dashboard/crm/contacts" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Contacts →
        </router-link>
      </div>

      <!-- Opportunities Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Opportunities Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Track sales opportunities and conversion rates.</p>
        <router-link to="/admin/dashboard/crm/opportunities" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Opportunities →
        </router-link>
      </div>

      <!-- Activities Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Activities Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Log meetings, calls, and follow-up actions.</p>
        <router-link to="/admin/dashboard/crm/activities" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Activities →
        </router-link>
      </div>
      
      <!-- CRM Users Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">CRM Users Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage CRM users, roles, and permissions.</p>
        <router-link to="/admin/dashboard/crm/users" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Users →
        </router-link>
      </div>
    </div>
  </div>
</template>
