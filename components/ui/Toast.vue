<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed top-5 right-5 space-y-2 z-50 max-w-xs w-full">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'p-4 rounded shadow text-white flex justify-between items-center',
        toast.type === 'success' ? 'bg-green-500' :
        toast.type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
      ]"
    >
      <div>{{ toast.message }}</div>
      <button @click="removeToast(toast.id)" class="ml-4 font-bold">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.toast-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
