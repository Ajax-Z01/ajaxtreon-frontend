<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import { usePurchases } from '~/composables/usePurchases'
import { useProducts } from '~/composables/useProducts'
import { useSuppliers } from '~/composables/useSuppliers'
import { useAuth } from '~/composables/useAuth'
import type { Purchase, PurchaseStatus } from '~/types/Purchase'
import { useToast } from '~/composables/useToast'

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

const form = ref<{
  supplierId: string
  productId: string
  quantity: number
  unitPrice: number
  status?: PurchaseStatus
  invoiceNo?: string
  notes?: string
}>({
  supplierId: '',
  productId: '',
  quantity: 1,
  unitPrice: 0,
  status: 'pending',
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
      delete rawForm.invoiceNo
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

watch(
  () => form.value.productId,
  (newId) => {
    const product = products.value.find(p => p.id === newId)
    form.value.unitPrice = product?.price || 0
  }
)
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/admin/dashboard"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
    >
      ← Back to Dashboard
    </NuxtLink>

    <h1 class="text-3xl font-bold mb-6">Purchase Management</h1>

    <div class="mb-4 text-right">
      <button
        @click="openAddForm"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Purchase
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="!purchases || purchases.length === 0" class="text-gray-500">No purchases available.</div>

    <div v-else>
      <ul class="grid gap-4 md:grid-cols-2">
        <li
          v-for="purchase in purchases"
          :key="purchase.id"
          class="p-6 bg-white rounded-lg shadow flex flex-col justify-between"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="text-blue-600 font-semibold">#{{ purchase.invoiceNo }}</div>
            <span
              class="text-sm px-2 py-1 rounded font-medium"
              :class="{
                'bg-yellow-100 text-yellow-800': purchase.status === 'pending',
                'bg-green-100 text-green-800': purchase.status === 'completed',
                'bg-red-100 text-red-800': purchase.status === 'cancelled'
              }"
            >
              {{ purchase.status }}
            </span>
          </div>

          <div class="text-sm text-gray-500 mb-1">Product:</div>
          <div class="text-lg font-semibold text-gray-800">
            {{ getProductNameById(purchase.productId) }}
          </div>

          <div class="text-sm text-gray-500 mt-2 mb-1">Supplier:</div>
          <div class="text-base text-gray-700">
            {{ getSupplierNameById(purchase.supplierId) }}
          </div>

          <div class="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              <span>Qty: </span><strong>{{ purchase.quantity }}</strong>
            </div>
            <div>
              <span>Price: </span>
              <strong>{{ formatRupiah(purchase.unitPrice) }}</strong>
            </div>
          </div>

          <div class="text-xs text-gray-400 mt-2">
            Created: {{ formatDate(purchase.createdAt) }}
          </div>

          <div class="flex gap-2 mt-4 justify-end">
            <button
              @click="openEditForm(purchase)"
              class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              Edit
            </button>
            <button
              @click="handleDelete(purchase.id)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal Form -->
    <div v-if="isFormOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 class="text-xl font-bold mb-4">{{ formTitle }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Supplier -->
          <div>
            <label class="block text-sm font-medium mb-1">Supplier</label>
            <select v-model="form.supplierId" class="w-full border rounded px-3 py-2" required :disabled="isEditing">
              <option disabled value="">-- Select Supplier --</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name || supplier.email }}
              </option>
            </select>
          </div>

          <!-- Product -->
          <div>
            <label class="block text-sm font-medium mb-1">Product</label>
            <select v-model="form.productId" class="w-full border rounded px-3 py-2" required :disabled="isEditing">
              <option disabled value="">-- Select Product --</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>

          <!-- Quantity -->
          <div>
            <label class="block text-sm font-medium mb-1">Quantity</label>
            <input v-model.number="form.quantity" type="number" min="1" class="w-full border rounded px-3 py-2" required :disabled="isEditing" />
          </div>

          <!-- Unit Price -->
          <input v-model.number="form.unitPrice" type="number" readonly class="w-full border rounded px-3 py-2 bg-gray-100" />

          <!-- Invoice No -->
          <div v-if="isEditing">
            <label class="block text-sm font-medium mb-1">Invoice No</label>
            <input v-model="form.invoiceNo" type="text" class="w-full border rounded px-3 py-2" disabled />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium mb-1">Notes</label>
            <textarea v-model="form.notes" class="w-full border rounded px-3 py-2" rows="3" :disabled="isEditing"></textarea>
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

          <div class="flex justify-end gap-2">
            <button type="button" @click="isFormOpen = false" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
