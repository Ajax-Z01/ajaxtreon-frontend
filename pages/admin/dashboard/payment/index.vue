<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '~/composables/auth/useAuth'
import { usePayment } from '~/composables/payment/usePayments'
import type { PaymentData } from '~/types/Payment'
import ModalCreatePayment from '~/components/modal/CreatePayment.vue'
import { useToast } from '~/composables/utils/useToast'
import { Plus, Trash2, CheckCircle2, Clock3, LoaderCircle } from 'lucide-vue-next'

const { currentUser } = useAuth()
const { createPayment, getAllPayments, updatePaymentStatus, deletePayment } = usePayment()
const { addToast } = useToast()

const processing = ref(false)
const showCreateModal = ref(false)

const newPaymentForm = reactive<PaymentData>({
  orderId: '',
  amount: 0,
  method: ''
})

const resetPaymentForm = () => {
  newPaymentForm.orderId = ''
  newPaymentForm.amount = 0
  newPaymentForm.method = ''
}

const { data: allData, refresh, execute, pending: loadingAll } = await useLazyAsyncData(
  'payments',
  async () => ({ payments: await getAllPayments() }),
  {
    watch: [() => currentUser.value?.id],
    default: () => ({ payments: [] })
  }
)

const payments = computed(() => allData.value?.payments ?? [])

const handleCreatePayment = async (formData: PaymentData) => {
  try {
    processing.value = true
    await createPayment(formData)
    await refresh()
    resetPaymentForm()
    showCreateModal.value = false
    addToast('Payment created successfully', 'success')
  } catch (error) {
    console.error(error)
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
    console.error(error)
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
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <NuxtLink
        to="/admin/dashboard"
        class="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition text-center"
      >
        ← Back to Dashboard
      </NuxtLink>

      <h1 class="text-2xl md:text-3xl font-bold text-center md:text-left">
        Payment Management
      </h1>

      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
      >
        <Plus class="w-4 h-4" /> Add Payment
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loadingAll" class="flex justify-center items-center py-10 text-gray-600">
      <LoaderCircle class="animate-spin w-5 h-5 mr-2" /> Loading payments...
    </div>

    <!-- Empty State -->
    <div v-else-if="payments.length === 0" class="text-center text-gray-500 py-10">
      No payments found.
    </div>

    <!-- Payment Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Order ID</th>
            <th class="px-4 py-3 text-left">Amount</th>
            <th class="px-4 py-3 text-left">Method</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Created At</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium whitespace-nowrap">{{ payment.orderId }}</td>
            <td class="px-4 py-3 whitespace-nowrap">$ {{ payment.amount.toFixed(2) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ payment.method || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
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
            <td class="px-4 py-3 whitespace-nowrap text-gray-500">
              {{ payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex flex-wrap gap-2">
                <button
                  @click="setPaymentStatus(payment.id, 'paid')"
                  class="flex items-center gap-1 text-green-600 hover:underline"
                >
                  <CheckCircle2 class="w-4 h-4" /> Paid
                </button>
                <button
                  @click="setPaymentStatus(payment.id, 'pending')"
                  class="flex items-center gap-1 text-yellow-600 hover:underline"
                >
                  <Clock3 class="w-4 h-4" /> Pending
                </button>
                <button
                  @click="handleDeletePayment(payment.id)"
                  class="flex items-center gap-1 text-red-600 hover:underline"
                >
                  <Trash2 class="w-4 h-4" /> Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <ModalCreatePayment
      :showModal="showCreateModal"
      @closeModal="showCreateModal = false"
      @createPayment="handleCreatePayment"
    />
  </div>
</template>
