import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import type { User } from '~/types/User'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isReady: false,
    isFetching: false,
  }),
  actions: {
    async fetchUser() {
      if (this.isReady || this.isFetching) return
      this.isFetching = true

      const auth = getAuth()
      const firestore = getFirestore()

      return new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          unsubscribe()
          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken()
              const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
              this.user = userDoc.exists() ? (userDoc.data() as User) : null
              this.token = token
            } catch (e) {
              console.error('Error fetching user:', e)
              this.user = null
              this.token = null
            }
          } else {
            this.user = null
            this.token = null
          }

          this.isReady = true
          this.isFetching = false
          resolve()
        })
      })
    },
  },
})
