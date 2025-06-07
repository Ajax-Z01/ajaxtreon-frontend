import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

import type { User } from '~/types/User'

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

export const getCurrentUserWithRole = (): Promise<{ user: User | null; token: string | null }> => {
  const auth = getAuth()
  const firestore = getFirestore()

  return new Promise(async (resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe()
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true)

          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            resolve({ user: userData, token })
          } else {
            resolve({ user: null, token })
          }
        } catch (error) {
          reject(error)
        }
      } else {
        resolve({ user: null, token: null })
      }
    }, reject)
  })
}
