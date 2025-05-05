<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegister } from '~/composables/useRegister'

const email = ref('')
const password = ref('')
const name = ref('')
const router = useRouter()
const { register, registerError, loading } = useRegister()

const handleRegister = async () => {
  if (loading.value) return
  try {
    await register(email.value, password.value, name.value)
    console.log('Registered successfully')
    router.push('/dashboard')
  } catch (e) {
    console.error('Registration failed', registerError.value)
    alert('Registration failed: ' + registerError.value)
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="max-w-md w-full bg-white p-8 rounded shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium">Username</label>
          <input
            type="text"
            id="name"
            v-model="name"
            required
            class="mt-2 p-2 w-full border border-gray-300 rounded"
          />
        </div>
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
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            :disabled="loading"
          >
            Register
          </button>
          <router-link to="/auth/login" class="text-sm text-blue-500">Login</router-link>
        </div>
        <div v-if="registerError" class="mt-4 text-red-500 text-sm">
          {{ registerError }}
        </div>
      </form>
    </div>
  </div>
</template>
