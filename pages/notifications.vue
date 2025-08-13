<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotifications } from '~/composables/notification/useNotifications'
import { LoaderCircle, CheckCircle2, Trash2 } from 'lucide-vue-next'
import type { Notification } from '~/types/Notification'

const { getNotifications, markAsRead } = useNotifications()

const notifications = ref<Notification[]>([])
const loading = ref(false)

const loadNotifications = async () => {
  loading.value = true
  try {
    notifications.value = await getNotifications()
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

const handleMarkAsRead = async (id: string) => {
  const notif = notifications.value.find(n => n.id === id)
  if (!notif) return

  notif.read = true // optimistik update
  try {
    await markAsRead(id)
  } catch (error) {
    console.error('Failed to mark as read:', error)
    notif.read = false // rollback jika error
  }
}

onMounted(loadNotifications)
</script>

<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-xl font-bold mb-4 flex items-center gap-2">
      Notifikasi
      <span
        v-if="notifications.some(n => !n.read)"
        class="text-xs bg-red-600 text-white rounded-full px-2 py-0.5"
      >
        {{ notifications.filter(n => !n.read).length }} belum dibaca
      </span>
    </h1>

    <div v-if="loading" class="flex justify-center items-center h-40">
      <LoaderCircle class="animate-spin w-6 h-6 text-gray-400" />
    </div>

    <div v-else-if="notifications.length === 0" class="text-center text-gray-500 mt-10">
      Tidak ada notifikasi.
    </div>

    <transition-group name="fade" tag="div" class="space-y-4">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="bg-white rounded-xl shadow p-4 border border-gray-200 flex justify-between items-start"
      >
        <div>
          <h2 class="font-semibold text-base">{{ notif.title }}</h2>
          <p class="text-sm text-gray-600 mb-1">{{ notif.message }}</p>
          <span
            class="text-xs uppercase font-medium"
            :class="{
              'text-blue-600': notif.type === 'info',
              'text-green-600': notif.type === 'success',
              'text-yellow-600': notif.type === 'warning',
              'text-red-600': notif.type === 'error',
            }"
          >
            {{ notif.type }}
          </span>
        </div>

        <div class="flex gap-2 mt-1">
          <button
            v-if="!notif.read"
            @click="handleMarkAsRead(notif.id)"
            class="text-sm flex items-center gap-1 text-blue-600 hover:underline"
          >
            <CheckCircle2 class="w-4 h-4" /> Tandai dibaca
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
