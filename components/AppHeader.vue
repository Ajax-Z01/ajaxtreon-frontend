<script setup lang="ts">
import { ref } from 'vue'
defineProps<{
  route: any
  isAuthenticated: boolean
  role: 'admin' | 'seller' | 'customer' | null
}>()

const mobileMenuOpen = ref(false)
</script>

<template>
  <header class="bg-blue-700 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <h1 class="text-2xl font-bold tracking-wide">
          <NuxtLink to="/" class="hover:opacity-90">Ajaxtreon</NuxtLink>
        </h1>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-6 text-base font-medium items-center">
          <NuxtLink
            to="/"
            :class="[
              'hover:underline transition',
              route.path === '/' ? 'font-semibold underline' : ''
            ]"
          >
            Home
          </NuxtLink>

          <template v-if="!isAuthenticated">
            <NuxtLink
              to="/auth/login"
              :class="[
                'hover:underline transition',
                route.path === '/auth/login' ? 'font-semibold underline' : ''
              ]"
            >
              Login
            </NuxtLink>
          </template>

          <template v-else>
            <NuxtLink
              :to="role === 'admin' ? '/admin/dashboard' : role === 'seller' ? '/seller/dashboard' : '/customer/dashboard'"
              :class="[
                'hover:underline transition',
                route.path.includes('/dashboard') ? 'font-semibold underline' : ''
              ]"
            >
              Dashboard
            </NuxtLink>

            <NuxtLink
              :to="role === 'admin' ? '/admin/profile' : role === 'seller' ? '/seller/profile' : '/customer/profile'"
              :class="[
                'hover:underline transition',
                route.path.includes('/profile') ? 'font-semibold underline' : ''
              ]"
            >
              Profile
            </NuxtLink>

            <NuxtLink
              to="/auth/logout"
              class="hover:underline transition"
            >
              Logout
            </NuxtLink>
          </template>
        </nav>

        <!-- Mobile Menu Button -->
        <button class="md:hidden focus:outline-none" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path :class="{ hidden: mobileMenuOpen }" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
            <path :class="{ hidden: !mobileMenuOpen }" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-blue-800 px-6 py-4 space-y-4 text-base font-medium">
      <NuxtLink to="/" @click="mobileMenuOpen = false" class="block hover:underline">Home</NuxtLink>

      <template v-if="!isAuthenticated">
        <NuxtLink to="/auth/login" @click="mobileMenuOpen = false" class="block hover:underline">Login</NuxtLink>
      </template>

      <template v-else>
        <NuxtLink
          :to="role === 'admin' ? '/admin/dashboard' : role === 'seller' ? '/seller/dashboard' : '/customer/dashboard'"
          @click="mobileMenuOpen = false"
          class="block hover:underline"
        >
          Dashboard
        </NuxtLink>

        <NuxtLink
          :to="role === 'admin' ? '/admin/profile' : role === 'seller' ? '/seller/profile' : '/customer/profile'"
          @click="mobileMenuOpen = false"
          class="block hover:underline"
        >
          Profile
        </NuxtLink>

        <NuxtLink to="/auth/logout" @click="mobileMenuOpen = false" class="block hover:underline">Logout</NuxtLink>
      </template>
    </div>
  </header>
</template>
