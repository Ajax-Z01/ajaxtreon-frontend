<script setup lang="ts">
import { ref, reactive } from 'vue'
import { X, CreditCard, Loader2 } from 'lucide-vue-next'

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
  <div v-if="showModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative border border-gray-200">
      <!-- Close Button -->
      <button
        @click="$emit('closeModal')"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Title -->
      <div class="flex items-center gap-2 mb-6">
        <CreditCard class="w-6 h-6 text-blue-600" />
        <h2 class="text-2xl font-bold text-gray-800">Create Payment</h2>
      </div>

      <!-- Form -->
      <form @submit="createPaymentHandler" class="space-y-5">
        <div>
          <label for="orderId" class="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
          <input
            v-model="form.orderId"
            type="text"
            id="orderId"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="ORD123456"
            required
          />
        </div>

        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            v-model.number="form.amount"
            type="number"
            id="amount"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="100000"
            required
          />
        </div>

        <div>
          <label for="method" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <input
            v-model="form.method"
            type="text"
            id="method"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Bank Transfer, QRIS, etc."
            required
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="$emit('closeModal')"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="processing"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Loader2 v-if="processing" class="w-4 h-4 animate-spin" />
            <span>Save</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
