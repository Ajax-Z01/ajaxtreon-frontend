<script setup>
import { useRouter } from 'vue-router'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import { ref, onMounted } from 'vue'

const router = useRouter()
const isLoggedIn = ref(false)
const isAuthReady = ref(false) // wait until Firebase finishes checking

const navigateToLogin = () => {
  router.push('/auth/login')
}

const navigateToRegister = () => {
  router.push('/auth/register')
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, user => {
    isLoggedIn.value = !!user
    isAuthReady.value = true
  })
})
</script>

<template>
  <div class="h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex justify-center items-center">
    <div class="text-center p-8">
      <h1 class="text-4xl font-bold mb-4">Welcome to Ajaxtreon</h1>
      <p class="text-xl mb-6">Your all-in-one platform for managing your business and tasks efficiently.</p>

      <!-- Render buttons only after auth check is ready -->
      <div v-if="isAuthReady" class="space-x-4">
        <button
          v-if="isLoggedIn"
          @click="navigateToDashboard"
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
