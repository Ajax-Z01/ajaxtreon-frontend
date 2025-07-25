import { defineNuxtPlugin } from '#app'
import * as lucide from 'lucide-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  for (const [name, component] of Object.entries(lucide)) {
    if (component && typeof component === 'object' && 'name' in component && 'render' in component) {
      nuxtApp.vueApp.component(name, component as import('vue').Component)
    }
  }
})
