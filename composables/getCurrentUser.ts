import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const getCurrentUser = () => {
  const auth = getAuth()

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}
