import { useUserStore } from '~/stores/userStore'

export const useCurrentUser = async () => {
  const userStore = useUserStore()
  if (!userStore.isReady) {
    await userStore.fetchUser()
  }
  return { user: userStore.user, token: userStore.token }
}
