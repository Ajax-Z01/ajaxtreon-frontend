<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-blue-700 text-white px-6 py-4 shadow-md">
      <div class="flex justify-between items-center max-w-7xl mx-auto">
        <!-- App Name -->
        <h1 class="text-2xl font-extrabold tracking-wide">
          <NuxtLink to="/" class="hover:underline">Ajaxtreon</NuxtLink>
        </h1>

        <!-- Navigation Links -->
        <nav class="space-x-6 text-base font-medium">
          <NuxtLink
            to="/"
            class="hover:underline"
            :class="{ 'font-semibold underline': route.path === '/' }"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="hover:underline"
            :class="{ 'font-semibold underline': route.path.startsWith('/dashboard') }"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/inventory"
            class="hover:underline"
            :class="{ 'font-semibold underline': route.path.startsWith('/inventory') }"
          >
            Inventory
          </NuxtLink>
          <NuxtLink
            to="/user"
            class="hover:underline"
            :class="{ 'font-semibold underline': route.path.startsWith('/user') }"
          >
            Users
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-grow bg-gray-50">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 text-center py-4 text-sm">
      © {{ new Date().getFullYear() }} Ajaxtreon ERP. All rights reserved.
    </footer>
  </div>
</template>
