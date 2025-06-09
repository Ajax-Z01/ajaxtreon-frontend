<script setup>
definePageMeta({
  middleware: ['seller-only']
})
import { useRouter } from 'vue-router'

const router = useRouter()
const { logout } = useAuth()

const logoutUser = async () => {
  await logout()
  router.push('/auth/login')
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <div class="flex items-center justify-between flex-wrap">
      <h1 class="text-3xl font-bold mb-6">Main Dashboard</h1>
      <button
        @click="logoutUser"
        class="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>

    <!-- Dashboard Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      <!-- Inventory Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Inventory Management</h2>
        <p class="text-gray-500 mb-4">Manage products, orders, and stock levels.</p>
        <router-link to="dashboard/inventory" class="text-blue-500 hover:text-blue-700">Go to Inventory Dashboard</router-link>
      </div>
      
      <!-- Seller Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Seller Management</h2>
        <p class="text-gray-500 mb-4">Manage sellers, products, and seller statuses.</p>
        <router-link to="dashboard/seller" class="text-blue-500 hover:text-blue-700">Go to Seller Dashboard</router-link>
      </div>
      
      <!-- Report Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Report Management</h2>
        <p class="text-gray-500 mb-4">Generate and view reports.</p>
        <router-link to="dashboard/report" class="text-blue-500 hover:text-blue-700">Go to Report Dashboard</router-link>
      </div>
    </div>
  </div>
</template>
