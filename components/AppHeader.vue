<script setup lang="ts">
defineProps<{
  route: any
  isAuthenticated: boolean
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

        <!-- Only show when NOT authenticated -->
        <NuxtLink
          v-if="!isAuthenticated"
          to="/auth/login"
          class="hover:underline"
          :class="{ 'font-semibold underline': route.path === '/auth/login' }"
        >
          Login
        </NuxtLink>

        <!-- Only show when authenticated -->
        <NuxtLink
          v-if="isAuthenticated"
          to="/dashboard"
          class="hover:underline"
          :class="{ 'font-semibold underline': route.path.startsWith('/dashboard') }"
        >
          Dashboard
        </NuxtLink>

        <NuxtLink
          v-if="isAuthenticated"
          to="/user"
          class="hover:underline"
          :class="{ 'font-semibold underline': route.path.startsWith('/user') }"
        >
          Users
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
