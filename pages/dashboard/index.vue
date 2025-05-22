<script setup>
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
        <router-link to="/inventory" class="text-blue-500 hover:text-blue-700">Go to Inventory Dashboard</router-link>
      </div>

      <!-- User Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">User Management</h2>
        <p class="text-gray-500 mb-4">Manage users, roles, and permissions.</p>
        <router-link to="/user" class="text-blue-500 hover:text-blue-700">Go to User Dashboard</router-link>
      </div>
      
      <!-- Order Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Order Management</h2>
        <p class="text-gray-500 mb-4">Manage orders, shipping, and order statuses.</p>
        <router-link to="/order" class="text-blue-500 hover:text-blue-700">Go to Order Dashboard</router-link>
      </div>
      
      <!-- Purchase Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Purchase Management</h2>
        <p class="text-gray-500 mb-4">Manage purchases, invoices, and purchase statuses.</p>
        <router-link to="/purchase" class="text-blue-500 hover:text-blue-700">Go to Purchase Dashboard</router-link>
      </div>

      <!-- Payment Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Payment Management</h2>
        <p class="text-gray-500 mb-4">Manage payments, invoices, and payment statuses.</p>
        <router-link to="/payment" class="text-blue-500 hover:text-blue-700">Go to Payment Dashboard</router-link>
      </div>
      
      <!-- Customer Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Customer Management</h2>
        <p class="text-gray-500 mb-4">Manage customers, orders, and customer statuses.</p>
        <router-link to="/customer" class="text-blue-500 hover:text-blue-700">Go to Customer Dashboard</router-link>
      </div>
      
      <!-- Supplier Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Supplier Management</h2>
        <p class="text-gray-500 mb-4">Manage suppliers, orders, and supplier statuses.</p>
        <router-link to="/supplier" class="text-blue-500 hover:text-blue-700">Go to Supplier Dashboard</router-link>
      </div>
      
      <!-- Report Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <h2 class="text-xl font-semibold mb-4">Report Management</h2>
        <p class="text-gray-500 mb-4">Generate and view reports.</p>
        <router-link to="/report" class="text-blue-500 hover:text-blue-700">Go to Report Dashboard</router-link>
      </div>
    </div>
  </div>
</template>
