import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let navigationStart = 0

  router.beforeEach((to, from) => {
    navigationStart = performance.now()
  })

  router.afterEach((to, from) => {
    const navigationEnd = performance.now()
    const navDuration = navigationEnd - navigationStart
    console.log(`[Navigation Timer] Navigasi ke "${to.fullPath}" selesai dalam ${navDuration.toFixed(2)} ms`)
  })

  nuxtApp.hook('page:finish', () => {
    const renderEnd = performance.now()
    const totalDuration = renderEnd - navigationStart
    console.log(`[Navigation Timer] Halaman selesai render dalam ${totalDuration.toFixed(2)} ms`)
  })
})
