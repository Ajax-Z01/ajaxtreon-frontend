<script setup lang="ts">
defineProps<{
  route: any
  isAuthenticated: boolean
  role: 'admin' | 'seller' | 'customer' | null
}>()
</script>

<template>
  <header class="bg-blue-700 text-white px-6 py-4 shadow-md">
    <div class="flex justify-between items-center max-w-7xl mx-auto">
      <h1 class="text-2xl font-extrabold tracking-wide">
        <NuxtLink to="/" class="hover:underline">Ajaxtreon</NuxtLink>
      </h1>

      <nav class="space-x-6 text-base font-medium">
        <NuxtLink
          to="/"
          class="hover:underline"
          :class="{ 'font-semibold underline': route.path === '/' }"
        >
          Home
        </NuxtLink>

        <!-- Show login if not authenticated -->
        <NuxtLink
          v-if="!isAuthenticated"
          to="/auth/login"
          class="hover:underline"
          :class="{ 'font-semibold underline': route.path === '/auth/login' }"
        >
          Login
        </NuxtLink>

        <!-- Show dashboard link if authenticated -->
        <NuxtLink
          v-if="isAuthenticated"
          :to="role === 'admin' ? '/admin/dashboard' : role === 'seller' ? '/seller/dashboard' : '/customer/dashboard'"
          class="hover:underline"
          :class="{ 'font-semibold underline': route.path.includes('/dashboard') }"
        >
          Dashboard
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
