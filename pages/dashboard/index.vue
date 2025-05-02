<script setup>
</script>

<template>
    <div class="p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6">Main Dashboard</h1>
  
      <!-- Dashboard Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
      </div>
    </div>
</template>
