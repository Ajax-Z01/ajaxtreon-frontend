<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterSeller } from '~/composables/useRegisterSeller'

const email = ref('')
const password = ref('')
const name = ref('')
const router = useRouter()
const { registerSeller, registerError, loading } = useRegisterSeller()

const handleRegisterSeller = async () => {
  if (loading.value) return
  try {
    await registerSeller(email.value, password.value, name.value)
    console.log('Seller registered successfully')
    router.push('/dashboard')
  } catch (e) {
    console.error('Seller registration failed', registerError.value)
    alert('Registration failed: ' + registerError.value)
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="max-w-md w-full bg-white p-8 rounded shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">Register Seller</h2>
      <form @submit.prevent="handleRegisterSeller">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium">Seller Name</label>
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
            class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            :disabled="loading"
          >
            Register Seller
          </button>
          <router-link to="/auth/login" class="text-sm text-green-600">Login</router-link>
        </div>
        <div v-if="registerError" class="mt-4 text-red-500 text-sm">
          {{ registerError }}
        </div>
      </form>
    </div>
  </div>
</template>
