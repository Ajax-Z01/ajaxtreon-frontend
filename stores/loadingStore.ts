import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    loading: false,
  }),
  actions: {
    setLoading(value: boolean) {
      this.loading = value
    },
    startLoading() {
      this.loading = true
    },
    stopLoading() {
      this.loading = false
    },
  },
})
