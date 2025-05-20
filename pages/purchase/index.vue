<script setup lang="ts">
import { ref, toRaw, onMounted, watch  } from 'vue'
import { usePurchases } from '~/composables/usePurchases'
import { useProducts } from '~/composables/useProducts'
import { useUsers } from '~/composables/useUsers'
import type { Purchase, PurchaseStatus } from '~/types/Purchase'
import type { Product } from '~/types/Inventory'
import type { User } from '~/types/User'

const { getPurchases, addPurchase, updatePurchaseStatus, deletePurchase } = usePurchases()
const { getProducts } = useProducts()
const { getUsers } = useUsers()

const { data: purchases = ref([]), pending: loading, refresh } = useAsyncData<Purchase[]>('purchases', getPurchases, { default: () => [] })
const { data: products = ref([]) } = useAsyncData<Product[]>('products', getProducts, { default: () => [] })
const users = ref<User[]>([])

onMounted(async () => {
  try {
    users.value = await getUsers()
  } catch (error) {
    console.error('Error fetching users:', error)
  }
})

const isFormOpen = ref(false)
const isEditing = ref(false)
const formTitle = ref('Add New Purchase')
const selectedPurchaseId = ref<string | null>(null)

// Form state: sesuai dengan backend's CreatePurchasePayload
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
  notes: '',
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
    notes: '',
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
    notes: purchase.notes || '',
  }
  selectedPurchaseId.value = purchase.id
  isEditing.value = true
  isFormOpen.value = true
}

const handleSubmit = async () => {
  try {
    const rawForm = toRaw(form.value);

    if (!isEditing.value) {
      delete rawForm.invoiceNo;
      await addPurchase(rawForm);
    } else if (selectedPurchaseId.value) {
      await updatePurchaseStatus(selectedPurchaseId.value, { status: rawForm.status! });
    }

    await refresh();
    isFormOpen.value = false;
  } catch (error) {
    console.error('Error submitting purchase form', error);
  }
};

const handleDelete = async (id: string) => {
  try {
    await deletePurchase(id)
    await refresh()
  } catch (error) {
    console.error('Error deleting purchase', error)
  }
}

const getProductNameById = (productId: string) => {
  const product = products.value.find(p => p.id === productId)
  return product?.name || 'Unknown Product'
}

const getSupplierNameById = (id: string) => {
  const user = users.value.find(u => u.id === id)
  return user?.name || user?.email || 'Unknown Supplier'
}

watch(
  () => form.value.productId,
  (newProductId) => {
    const product = products.value.find(p => p.id === newProductId)
    if (product) {
      form.value.unitPrice = product.price
    } else {
      form.value.unitPrice = 0
    }
  }
)
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/dashboard"
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
      <ul class="space-y-4">
        <li v-for="purchase in purchases" :key="purchase.id" class="p-6 bg-white shadow rounded-lg flex justify-between items-center">
          <div class="text-lg font-semibold">
            Invoice No: {{ purchase.invoiceNo }}
          </div>
          <div class="text-lg font-semibold">
            Product: {{ getProductNameById(purchase.productId) }}
          </div>
          <div class="text-lg font-semibold">
            Supplier: {{ getSupplierNameById(purchase.supplierId) }}
          </div>
          <div class="flex gap-4">
            <div><strong>Qty:</strong> {{ purchase.quantity }}</div>
            <div><strong>Status:</strong> {{ purchase.status }}</div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEditForm(purchase)"
              class="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              @click="handleDelete(purchase.id)"
              class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name || user.email }}
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
