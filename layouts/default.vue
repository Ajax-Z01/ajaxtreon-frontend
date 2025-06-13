<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getCurrentUserWithRole } from '@/composables/getCurrentUser'
import { ref } from 'vue'

const route = useRoute()
const { initAuth, currentUser } = useAuth()
const userRole = ref<'admin' | 'seller' | 'customer' | null>(null)
const loading = ref(true)

async function initialize() {
  loading.value = true
  await initAuth()

  if (currentUser.value) {
    const { user } = await getCurrentUserWithRole()
    const allowedRoles = ['admin', 'seller', 'customer'] as const

    if (user?.role && allowedRoles.includes(user.role as any)) {
      userRole.value = user.role as typeof allowedRoles[number]
    } else {
      userRole.value = null
    }
  }
  loading.value = false
}
initialize()
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center h-screen">
      <p>Loading authentication...</p>
    </div>

    <div>
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
  </div>
</template>
