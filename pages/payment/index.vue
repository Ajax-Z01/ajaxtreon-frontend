<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { usePayment } from '~/composables/usePayments'
import type { PaymentData } from '~/types/Payment'
import ModalCreatePayment from '~/components/ModalCreatePayment.vue'

const { createPayment, getAllPayments, updatePaymentStatus, deletePayment } = usePayment()

const { data: paymentsData, refresh: refreshPayments, pending: loadingPayments } = await useAsyncData('payments', getAllPayments)

const processing = ref(false)
const errorMessage = ref<string | null>(null)

const showCreateModal = ref(false)

const newPaymentForm = reactive<PaymentData>({
  orderId: '',
  amount: 0,
  method: ''
})

const isValidPaymentForm = computed(() => {
  return newPaymentForm.orderId !== '' && newPaymentForm.amount > 0 && newPaymentForm.method !== ''
})

const resetPaymentForm = () => {
  newPaymentForm.orderId = ''
  newPaymentForm.amount = 0
  newPaymentForm.method = ''
}

const handleCreatePayment = async (formData: PaymentData) => {
  try {
    processing.value = true
    const createdPayment = await createPayment(formData)
    if (createdPayment) {
      await refreshPayments()
      resetPaymentForm()
      showCreateModal.value = false
    }
  } catch (error) {
    console.error('Error creating payment:', error)
    errorMessage.value = 'Error creating payment'
  } finally {
    processing.value = false
  }
}

const handleDeletePayment = async (id: string) => {
  try {
    console.log('Delete payment with id:', id)
    await deletePayment(id)
    await refreshPayments()
  } catch (error) {
    console.error('Error deleting payment:', error)
    errorMessage.value = 'Error deleting payment'
  }
}

const setPaymentStatus = async (id: string, status: string) => {
  await updatePaymentStatus(id, status)
  await refreshPayments()
}

const payments = computed(() => paymentsData.value || [])
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/dashboard"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>
    
    <h1 class="text-3xl font-bold mb-6">Payment Management</h1>

    <!-- Add Payment Button -->
    <div class="mb-4 text-right">
      <button
        @click="showCreateModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Payment
      </button>
    </div>

    <!-- Payment List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Payments</h2>
      <table class="min-w-full table-auto">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left">Order ID</th>
            <th class="px-4 py-2 text-left">Amount</th>
            <th class="px-4 py-2 text-left">Method</th>
            <th class="px-4 py-2 text-left">Status</th>
            <th class="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td class="px-4 py-2">{{ payment.orderId }}</td>
            <td class="px-4 py-2">{{ payment.amount }}</td>
            <td class="px-4 py-2">{{ payment.method }}</td>
            <td class="px-4 py-2">{{ payment.status }}</td>
            <td class="px-4 py-2">
              <button
                @click="setPaymentStatus(payment.id, 'completed')"
                class="text-green-500 hover:text-green-700"
              >
                Mark as Completed
              </button>
              <button
                @click="setPaymentStatus(payment.id, 'pending')"
                class="text-yellow-500 hover:text-yellow-700 ml-4"
              >
                Mark as Pending
              </button>
              <button
                @click="handleDeletePayment(payment.id)"
                class="text-red-500 hover:text-red-700 ml-4"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create Payment -->
    <ModalCreatePayment :showModal="showCreateModal" @closeModal="showCreateModal = false" @createPayment="handleCreatePayment" />
  </div>
</template>

