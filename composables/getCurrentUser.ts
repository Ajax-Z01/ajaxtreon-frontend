import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'

export const getCurrentUserWithToken = (): Promise<{ user: FirebaseUser | null; token: string | null }> => {
  const auth = getAuth()

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      if (user) {
        const token = await user.getIdToken(true)
        resolve({ user, token })
      } else {
        resolve({ user: null, token: null })
      }
    }, reject)
  })
}
