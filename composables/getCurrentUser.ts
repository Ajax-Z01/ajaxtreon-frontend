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
      console.log('Firebase User:', firebaseUser)
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true)
          console.log('Token:', token)

          const userDocRef = doc(firestore, 'users', firebaseUser.uid)
          console.log('Fetching userDoc:', userDocRef.path)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            console.log('User doc data:', userData)
            resolve({ user: userData, token })
          } else {
            console.warn('User doc does not exist for UID:', firebaseUser.uid)
            resolve({ user: null, token })
          }
        } catch (error) {
          console.error('Error fetching user doc:', error)
          reject(error)
        }
      } else {
        console.log('No firebase user logged in')
        resolve({ user: null, token: null })
      }
    }, reject)
  })
}
