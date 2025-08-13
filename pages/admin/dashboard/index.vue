<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/auth/useAuth'

const router = useRouter()
const { logout } = useAuth()

const logoutUser = async () => {
  await logout()
  router.push('/auth/login')
}
</script>

<template>
  <div class="p-4 sm:p-8 bg-gray-100 min-h-screen">
    <div class="flex flex-col sm:flex-row items-center justify-between flex-wrap mb-6 gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold">Main Dashboard</h1>
      <button
        @click="logoutUser"
        class="bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 transition w-full sm:w-auto text-center"
      >
        Logout
      </button>
    </div>

    <!-- Dashboard Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Inventory Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Inventory Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage products, orders, and stock levels.</p>
        <router-link to="dashboard/inventory" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Inventory Dashboard →
        </router-link>
      </div>

      <!-- User Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">User Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage users, roles, and permissions.</p>
        <router-link to="dashboard/user" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to User Dashboard →
        </router-link>
      </div>

      <!-- Order Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Order Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage orders, shipping, and order statuses.</p>
        <router-link to="dashboard/order" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Order Dashboard →
        </router-link>
      </div>

      <!-- Purchase Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Purchase Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage purchases, invoices, and purchase statuses.</p>
        <router-link to="dashboard/purchase" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Purchase Dashboard →
        </router-link>
      </div>

      <!-- Payment Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Payment Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage payments, invoices, and payment statuses.</p>
        <router-link to="dashboard/payment" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Payment Dashboard →
        </router-link>
      </div>

      <!-- Customer Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Customer Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage customers, orders, and customer statuses.</p>
        <router-link to="dashboard/customer" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Customer Dashboard →
        </router-link>
      </div>

      <!-- Seller Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Seller Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage sellers, products, and seller statuses.</p>
        <router-link to="dashboard/seller" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Seller Dashboard →
        </router-link>
      </div>

      <!-- Supplier Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Supplier Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Manage suppliers, orders, and supplier statuses.</p>
        <router-link to="dashboard/supplier" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Supplier Dashboard →
        </router-link>
      </div>

      <!-- Report Management Card -->
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between">
        <h2 class="text-xl font-semibold mb-4">Report Management</h2>
        <p class="text-gray-500 mb-6 flex-grow">Generate and view reports.</p>
        <router-link to="dashboard/report" class="text-blue-500 hover:text-blue-700 font-medium">
          Go to Report Dashboard →
        </router-link>
      </div>
    </div>
  </div>
</template>
