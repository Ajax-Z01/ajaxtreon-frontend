<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()

function mapRole(role: string | null | undefined): 'admin' | 'customer' | 'seller' | null {
  if (role === 'admin' || role === 'seller' || role === 'customer') return role
  return null
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div v-if="!userStore.isReady" class="flex flex-col justify-center items-center h-screen bg-white">
      <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      <p class="text-gray-600 text-lg">Loading Page...</p>
    </div>

    <template v-else>
      <AppHeader
        :route="route"
        :isAuthenticated="!!userStore.user"
        :role="mapRole(userStore.user?.role)"
      />
      <main class="flex-grow bg-gray-50">
        <NuxtPage />
      </main>
      <AppFooter />
    </template>
  </div>
</template>
