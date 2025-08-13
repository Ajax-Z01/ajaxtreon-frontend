<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/auth/useAuth'
import { useUserStore } from '~/stores/userStore'

const { login, error, loading } = useAuth()
const email = ref('')
const password = ref('')
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.isReady) {
    await userStore.fetchUser()
  }

  const user = userStore.user
  if (user && user.role) {
    switch (user.role) {
      case 'admin':
        return router.replace('/admin/dashboard')
      case 'seller':
        return router.replace('/seller/dashboard')
      default:
        return router.replace('/customer/dashboard')
    }
  }
})

const handleLogin = async () => {
  if (loading.value) return
  try {
    const { role, error: loginError } = await login(email.value, password.value)

    console.log('Login result:', { role, loginError })

    if (!loginError && role) {
      await nextTick()

      switch (role) {
        case 'admin':
          return router.replace('/admin/dashboard')
        case 'seller':
          return router.replace('/seller/dashboard')
        default:
          return router.replace('/customer/dashboard')
      }
    } else {
      alert('Login failed: ' + loginError)
    }
  } catch (e) {
    console.error('Unexpected error during login', e)
    alert('Unexpected error: ' + (e instanceof Error ? e.message : String(e)))
  }
}

</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="max-w-md w-full bg-white p-8 rounded shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="mt-2 p-2 w-full border border-gray-300 rounded"
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="mt-2 p-2 w-full border border-gray-300 rounded"
          />
        </div>
        <div class="flex justify-between items-center">
          <button
            type="submit"
            class="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <svg
              v-if="loading"
              class="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
          </button>
          <router-link to="/auth/register" class="text-sm text-blue-500">Register</router-link>
        </div>
        <div v-if="error" class="mt-4 text-red-500 text-sm">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>
