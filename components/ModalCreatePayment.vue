<script setup lang="ts">
import { ref, reactive } from 'vue'

defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'closeModal'): void
  (e: 'createPayment', paymentData: { orderId: string; amount: number; method: string }): void
}>()

const form = reactive({
  orderId: '',
  amount: 0,
  method: ''
})

const processing = ref(false)

const createPaymentHandler = async (event: Event) => {
  event.preventDefault()
  try {
    processing.value = true
    await emit('createPayment', { ...form })
  } catch (error) {
    console.error('Error creating payment:', error)
  } finally {
    processing.value = false
  }
}
</script>

<template>
    <div v-if="showModal" class="fixed inset-0 z-50 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-96">
        <h2 class="text-xl font-semibold mb-4">Create Payment</h2>
        
        <form @submit="createPaymentHandler">
          <div class="mb-4">
            <label for="orderId" class="block text-sm font-medium text-gray-700">Order ID</label>
            <input
              v-model="form.orderId"
              type="text"
              id="orderId"
              class="w-full mt-2 p-2 border rounded"
              required
            />
          </div>
  
          <div class="mb-4">
            <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
            <input
              v-model="form.amount"
              type="number"
              id="amount"
              class="w-full mt-2 p-2 border rounded"
              required
            />
          </div>
  
          <div class="mb-4">
            <label for="method" class="block text-sm font-medium text-gray-700">Payment Method</label>
            <input
              v-model="form.method"
              type="text"
              id="method"
              class="w-full mt-2 p-2 border rounded"
              required
            />
          </div>
  
          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="$emit('closeModal')"
              class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="processing"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
</template>
  