<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import { ref, computed, onMounted } from 'vue'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'

const router = useRouter()

// State
const isAuthReady = ref(false)
const isLoggedIn = ref(false)
const userRole = ref<string | null>(null)
const isFetchingRole = ref(false)

// Navigation methods
const navigateToLogin = () => router.push('/auth/login')
const navigateToRegister = () => router.push('/auth/register')

const navigateToDashboard = (role?: string) => {
  if (role === 'admin') router.push('/admin/dashboard')
  else if (role === 'seller') router.push('/seller/dashboard')
  else router.push('/customer/dashboard')
}

const onClickDashboard = () => {
  navigateToDashboard(userRole.value || undefined)
}

// Computed to control UI display
const isLoading = computed(() => isLoggedIn.value && (isFetchingRole.value || !userRole.value))

// Check auth on mount
onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, async user => {
    isLoggedIn.value = !!user
    isAuthReady.value = true

    if (user) {
      isFetchingRole.value = true
      try {
        const { user: currentUser } = await getCurrentUserWithRole()
        userRole.value = currentUser?.role ?? null

        if (userRole.value) {
          navigateToDashboard(userRole.value)
        }
      } catch (error) {
        console.error('Failed to get user role:', error)
      } finally {
        isFetchingRole.value = false
      }
    }
  })
})
</script>

<template>
  <div class="h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex justify-center items-center">
    <div class="text-center p-8">
      <h1 class="text-4xl font-bold mb-4">Welcome to Ajaxtreon</h1>
      <p class="text-xl mb-6">Your all-in-one platform for managing your business and tasks efficiently.</p>

      <div v-if="isAuthReady">
        <div v-if="isLoading" class="text-lg animate-pulse">Loading your dashboard...</div>

        <button
          v-else-if="isLoggedIn"
          @click="onClickDashboard"
          class="bg-blue-800 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-900 transition"
        >
          Go to Dashboard
        </button>

        <template v-else>
          <button
            @click="navigateToLogin"
            class="bg-blue-700 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Login
          </button>
          <button
            @click="navigateToRegister"
            class="bg-transparent border-2 border-white text-white py-2 px-6 rounded-lg shadow-md hover:bg-white hover:text-gray-900 transition"
          >
            Register
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
