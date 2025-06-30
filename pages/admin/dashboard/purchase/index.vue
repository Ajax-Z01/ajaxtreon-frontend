<script setup lang="ts">
import { ref, reactive, computed, watch, toRaw } from 'vue'
import { usePurchases } from '~/composables/usePurchases'
import { useProducts } from '~/composables/useProducts'
import { useSuppliers } from '~/composables/useSuppliers'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import type { Purchase, PurchaseStatus } from '~/types/Purchase'

import { Plus, Edit, Trash2, LoaderCircle } from 'lucide-vue-next'

const { getPurchases, addPurchase, updatePurchaseStatus, deletePurchase } = usePurchases()
const { getProducts } = useProducts()
const { getSuppliers } = useSuppliers()
const { currentUser } = useAuth()
const { addToast } = useToast()

const { data: allData, refresh, pending: loading } = await useLazyAsyncData(
  'purchase-management',
  async () => {
    const [purchasesRes, productsRes, suppliersRes] = await Promise.all([
      getPurchases(),
      getProducts(),
      getSuppliers()
    ])
    return {
      purchases: purchasesRes,
      products: productsRes,
      suppliers: suppliersRes
    }
  },
  {
    default: () => ({
      purchases: [],
      products: [],
      suppliers: []
    }),
    watch: [() => currentUser.value?.id]
  }
)

const purchases = computed(() => allData.value?.purchases || [])
const products = computed(() => allData.value?.products || [])
const suppliers = computed(() => allData.value?.suppliers || [])

const isFormOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const formTitle = ref('Add New Purchase')
const selectedPurchaseId = ref<string | null>(null)

const form = ref({
  supplierId: '',
  productId: '',
  quantity: 1,
  unitPrice: 0,
  status: 'pending' as PurchaseStatus,
  invoiceNo: '',
  notes: ''
})

const openAddForm = () => {
  formTitle.value = 'Add New Purchase'
  form.value = {
    supplierId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    status: 'pending',
    invoiceNo: '',
    notes: ''
  }
  isEditing.value = false
  isFormOpen.value = true
}

const openEditForm = (purchase: Purchase) => {
  formTitle.value = 'Update Purchase Status'
  form.value = {
    supplierId: purchase.supplierId,
    productId: purchase.productId,
    quantity: purchase.quantity,
    unitPrice: purchase.unitPrice,
    status: purchase.status || 'pending',
    invoiceNo: purchase.invoiceNo || '',
    notes: purchase.notes || ''
  }
  selectedPurchaseId.value = purchase.id
  isEditing.value = true
  isFormOpen.value = true
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    const rawForm = toRaw(form.value)

    if (!isEditing.value) {
      delete (rawForm as any).invoiceNo
      await addPurchase(rawForm)
      addToast('Purchase added successfully', 'success')
    } else if (selectedPurchaseId.value) {
      await updatePurchaseStatus(selectedPurchaseId.value, { status: rawForm.status! })
      addToast('Purchase status updated', 'success')
    }

    await refresh()
    isFormOpen.value = false
  } catch (error) {
    console.error('Error submitting form:', error)
    addToast('Failed to submit purchase', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await deletePurchase(id)
    await refresh()
    addToast('Purchase deleted', 'success')
  } catch (error) {
    console.error('Error deleting purchase:', error)
    addToast('Failed to delete purchase', 'error')
  }
}

const getProductNameById = (productId: string) =>
  products.value.find(p => p.id === productId)?.name || 'Unknown Product'

const getSupplierNameById = (id: string) => {
  const supplier = suppliers.value.find(s => s.id === id)
  return supplier?.name || supplier?.email || 'Unknown Supplier'
}

const formatRupiah = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID')}`

const formatDate = (value: string | Date) =>
  (typeof value === 'string' ? new Date(value) : value).toLocaleString('id-ID')

watch(() => form.value.productId, (newId) => {
  const product = products.value.find(p => p.id === newId)
  form.value.unitPrice = product?.price || 0
})
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

      <h1 class="text-2xl md:text-3xl font-bold text-center md:text-left">Purchase Management</h1>

      <button
        @click="openAddForm"
        class="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
      >
        <Plus class="w-4 h-4" /> Add Purchase
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-16 text-gray-500">
      <LoaderCircle class="animate-spin w-6 h-6 mr-2" /> Loading purchases...
    </div>

    <!-- Empty -->
    <div v-else-if="!purchases || purchases.length === 0" class="text-center text-gray-500 py-16">
      No purchases available.
    </div>

    <!-- List -->
    <div v-else>
      <ul class="grid gap-4 md:grid-cols-2">
        <li
          v-for="purchase in purchases"
          :key="purchase.id"
          class="p-6 bg-white rounded-lg shadow flex flex-col gap-3"
        >
          <div class="flex justify-between items-center">
            <div class="font-semibold text-blue-600 text-sm">#{{ purchase.invoiceNo }}</div>
            <span
              class="text-xs px-2 py-1 rounded font-medium"
              :class="{
                'bg-yellow-100 text-yellow-800': purchase.status === 'pending',
                'bg-green-100 text-green-800': purchase.status === 'completed',
                'bg-red-100 text-red-800': purchase.status === 'cancelled'
              }"
            >
              {{ purchase.status }}
            </span>
          </div>

          <div>
            <p class="text-sm text-gray-500">Product:</p>
            <p class="text-base font-medium">{{ getProductNameById(purchase.productId) }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Supplier:</p>
            <p class="text-base">{{ getSupplierNameById(purchase.supplierId) }}</p>
          </div>

          <div class="flex justify-between text-sm text-gray-600">
            <div>Qty: <strong>{{ purchase.quantity }}</strong></div>
            <div>Price: <strong>{{ formatRupiah(purchase.unitPrice) }}</strong></div>
          </div>

          <div class="text-xs text-gray-400">Created: {{ formatDate(purchase.createdAt) }}</div>

          <div class="flex gap-2 justify-end mt-2">
            <button @click="openEditForm(purchase)" class="flex items-center gap-1 bg-yellow-500 text-white text-sm px-3 py-1 rounded hover:bg-yellow-600">
              <Edit class="w-4 h-4" /> Edit
            </button>
            <button @click="handleDelete(purchase.id)" class="flex items-center gap-1 bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600">
              <Trash2 class="w-4 h-4" /> Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal Form -->
    <div v-if="isFormOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg max-h-screen overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">{{ formTitle }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Supplier -->
          <div>
            <label class="block text-sm font-medium mb-1">Supplier</label>
            <select v-model="form.supplierId" class="w-full border rounded px-3 py-2" required :disabled="isEditing">
              <option disabled value="">-- Select Supplier --</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">
                {{ s.name || s.email }}
              </option>
            </select>
          </div>

          <!-- Product -->
          <div>
            <label class="block text-sm font-medium mb-1">Product</label>
            <select v-model="form.productId" class="w-full border rounded px-3 py-2" required :disabled="isEditing">
              <option disabled value="">-- Select Product --</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <!-- Quantity -->
          <div>
            <label class="block text-sm font-medium mb-1">Quantity</label>
            <input v-model.number="form.quantity" type="number" min="1" class="w-full border rounded px-3 py-2" required :disabled="isEditing" />
          </div>

          <!-- Unit Price -->
          <div>
            <label class="block text-sm font-medium mb-1">Unit Price</label>
            <input v-model.number="form.unitPrice" type="number" readonly class="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium mb-1">Notes</label>
            <textarea v-model="form.notes" class="w-full border rounded px-3 py-2" rows="2" :disabled="isEditing"></textarea>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium mb-1">Status</label>
            <select v-model="form.status" class="w-full border rounded px-3 py-2">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-2">
            <button type="button" @click="isFormOpen = false" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" :disabled="isSubmitting">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
