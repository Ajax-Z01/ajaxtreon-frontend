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
    <ClientOnly>
      <div v-if="!userStore.isReady" class="flex flex-col justify-center items-center h-screen bg-white">
        <!-- Loading spinner -->
      </div>
      <div v-else class="flex flex-col flex-grow">
        <AppHeader
          :route="route"
          :isAuthenticated="!!userStore.user"
          :role="mapRole(userStore.user?.role)"
        />
        <main class="flex-grow bg-gray-50">
          <NuxtPage />
        </main>
        <AppFooter />
      </div>
    </ClientOnly>
  </div>
</template>
