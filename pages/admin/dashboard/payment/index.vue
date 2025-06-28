<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePayment } from '~/composables/usePayments'
import type { PaymentData } from '~/types/Payment'
import ModalCreatePayment from '~/components/modal/CreatePayment.vue'
import { useToast } from '~/composables/useToast'

const { currentUser } = useAuth()
const { createPayment, getAllPayments, updatePaymentStatus, deletePayment } = usePayment()
const { addToast } = useToast()

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

const { data: allData, refresh, execute, pending: loadingAll } = await useLazyAsyncData(
  'payments',
  async () => {
    const [paymentsRes] = await Promise.all([
      getAllPayments()
    ])
    return { payments: paymentsRes }
  },
  {
    watch: [() => currentUser.value?.id],
    default: () => ({ payments: [] })
  }
)

const payments = computed(() => allData.value?.payments ?? [])

const handleCreatePayment = async (formData: PaymentData) => {
  try {
    processing.value = true
    const createdPayment = await createPayment(formData)
    if (createdPayment) {
      await refresh()
      resetPaymentForm()
      showCreateModal.value = false
      addToast('Payment created successfully', 'success')
    }
  } catch (error) {
    console.error('Error creating payment:', error)
    errorMessage.value = 'Error creating payment'
    addToast('Failed to create payment', 'error')
  } finally {
    processing.value = false
  }
}

const handleDeletePayment = async (id: string) => {
  try {
    await deletePayment(id)
    await refresh()
    addToast('Payment deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting payment:', error)
    addToast('Failed to delete payment', 'error')
  }
}

const setPaymentStatus = async (id: string, status: string) => {
  try {
    await updatePaymentStatus(id, status)
    await refresh()
    addToast(`Payment marked as ${status}`, 'success')
  } catch (error) {
    addToast('Failed to update payment status', 'error')
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/admin/dashboard"
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
      <table class="min-w-full table-auto border border-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Order ID</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Method</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in payments"
            :key="payment.id"
            class="border-t border-gray-200 hover:bg-gray-50"
          >
            <td class="px-4 py-2 text-sm text-gray-800">{{ payment.orderId }}</td>
            <td class="px-4 py-2 text-sm text-gray-800">$ {{ payment.amount.toFixed(2) }}</td>
            <td class="px-4 py-2 text-sm text-gray-800">{{ payment.method || '-' }}</td>
            <td class="px-4 py-2">
              <span
                class="text-xs font-medium px-2 py-1 rounded"
                :class="{
                  'bg-yellow-100 text-yellow-700': payment.status === 'pending',
                  'bg-green-100 text-green-700': payment.status === 'paid',
                  'bg-gray-100 text-gray-700': !payment.status
                }"
              >
                {{ payment.status || '-' }}
              </span>
            </td>
            <td class="px-4 py-2 text-sm text-gray-500">
              {{ payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-' }}
            </td>
            <td class="px-4 py-2 text-sm">
              <div class="flex flex-wrap gap-2">
                <button
                  @click="setPaymentStatus(payment.id, 'paid')"
                  class="text-green-600 hover:underline"
                >
                  Paid
                </button>
                <button
                  @click="setPaymentStatus(payment.id, 'pending')"
                  class="text-yellow-600 hover:underline"
                >
                  Pending
                </button>
                <button
                  @click="handleDeletePayment(payment.id)"
                  class="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create Payment -->
    <ModalCreatePayment :showModal="showCreateModal" @closeModal="showCreateModal = false" @createPayment="handleCreatePayment" />
  </div>
</template>

