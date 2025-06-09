<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getCurrentUserWithRole } from '@/composables/getCurrentUser'
import { ref } from 'vue'

const route = useRoute()
const { initAuth, authReady, currentUser } = useAuth()
const userRole = ref<'admin' | 'seller' | 'customer' | null>(null)

await initAuth()

if (currentUser.value) {
  const { user } = await getCurrentUserWithRole()
  userRole.value = user?.role ?? null
}
</script>

<template>
  <div v-if="authReady">
    <div class="flex flex-col min-h-screen">
      <AppHeader
        :route="route"
        :isAuthenticated="!!currentUser"
        :role="userRole"
      />
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
