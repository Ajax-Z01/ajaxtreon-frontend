import { defineNuxtPlugin, useState } from '#app'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  const isAuthReady = useState('isAuthReady', () => false)

  if (!userStore.isReady && !userStore.isFetching) {
    await userStore.fetchUser()
  }
  isAuthReady.value = true
})
