<script setup>
import { useNuxtApp } from '#app';  // Access Nuxt app instance
import { useRouter } from 'vue-router';
import { getAuth, signOut } from 'firebase/auth';

const router = useRouter();
const nuxtApp = useNuxtApp();
const auth = nuxtApp.$auth;  // Access Firebase auth from the plugin

const user = ref(null);

const fetchUser = async () => {
  const authUser = getAuth().currentUser;
  if (authUser) {
    user.value = {
      email: authUser.email,
      uid: authUser.uid
    };
  } else {
    router.push('/auth/login');  // Redirect to login page if not authenticated
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Logout failed', error.message);
    alert('Logout failed: ' + error.message);
  }
};

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="max-w-md w-full bg-white p-8 rounded shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">Profile</h2>
      <div class="mb-4">
        <strong>Email:</strong> <span>{{ user?.email }}</span>
      </div>
      <div class="mb-4">
        <strong>User ID:</strong> <span>{{ user?.uid }}</span>
      </div>
      <div class="flex justify-center">
        <button
          @click="handleLogout"
          class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
