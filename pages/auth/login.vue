<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const { login, error, loading } = useAuth();
const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  if (loading.value) return;
  try {
    await login(email.value, password.value);
    if (!error.value) {
      console.log('Logged in');
      router.push('/dashboard');
    } else {
      console.error('Login failed:', error.value);
      alert('Login failed: ' + error.value);
    }
  } catch (e) {
    console.error('Unexpected error during login', e);
    alert('Unexpected error: ' + (e instanceof Error ? e.message : String(e)));
  }
};

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
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            :disabled="loading.value"
          >
            Login
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
