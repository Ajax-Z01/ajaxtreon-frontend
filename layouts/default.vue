<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { initAuth, authReady, currentUser } = useAuth()
await initAuth()
</script>

<template>
  <div v-if="authReady">
    <div class="flex flex-col min-h-screen">
      <AppHeader :route="route" :isAuthenticated="!!currentUser" />
      <main class="flex-grow bg-gray-50">
        <NuxtPage />
      </main>
      <AppFooter />
    </div>
  </div>

  <div v-else class="flex justify-center items-center h-screen">
    <p>Loading authentication...</p>
  </div>
</template>
