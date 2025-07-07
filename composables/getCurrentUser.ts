import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

import type { User } from '~/types/User'

export const getCurrentUserWithToken = async (): Promise<{ user: FirebaseUser | null; token: string | null }> => {
  const auth = getAuth()
  const user = auth.currentUser

  if (user) {
    try {
      const token = await user.getIdToken(true)
      return { user, token }
    } catch (err) {
      console.error('Failed to get token:', err)
      return { user: null, token: null }
    }
  }

  return { user: null, token: null }
}

export const getCurrentUserWithRole = async (): Promise<{ user: User | null; token: string | null }> => {
  const auth = getAuth()
  const firestore = getFirestore()

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe()
      if (!firebaseUser) {
        resolve({ user: null, token: null })
        return
      }
      try {
        const token = await firebaseUser.getIdToken(true)
        const userDocRef = doc(firestore, 'users', firebaseUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data() as User
          resolve({ user: userData, token })
        } else {
          resolve({ user: null, token })
        }
      } catch (error) {
        reject(error)
      }
    }, reject)
  })
}
