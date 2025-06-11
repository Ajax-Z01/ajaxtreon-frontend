<script setup lang="ts">
import { computed } from 'vue'
import { useLoadingStore } from '~/stores/loadingStore'

const loadingStore = useLoadingStore()
const loading = computed(() => loadingStore.loading)
</script>

<template>
  <div v-if="loading" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
    <div class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
  </div>
</template>

<style scoped>
.loader {
  border-top-color: #3498db;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
