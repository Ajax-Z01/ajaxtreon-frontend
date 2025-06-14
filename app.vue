<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()

onMounted(async () => {
  auth.loadTokenFromStorage()
  await auth.initAuth()
})
</script>


<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
