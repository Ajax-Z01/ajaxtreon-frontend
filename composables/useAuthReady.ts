// composables/useAuthReady.ts
import { useUserStore } from '~/stores/userStore'

export const useAuthReady = async () => {
  const userStore = useUserStore()

  if (!userStore.isReady) {
    await userStore.fetchUser()

    let retries = 0
    while (!userStore.isReady && retries < 20) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      retries++
    }
  }

  return userStore
}
