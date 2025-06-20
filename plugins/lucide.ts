import { defineNuxtPlugin } from '#app'
import * as lucide from 'lucide-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  for (const [name, component] of Object.entries(lucide)) {
    nuxtApp.vueApp.component(name, component)
  }
})
