<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOrders } from '~/composables/useOrders'
import { useProducts } from '~/composables/useProducts'
import type { Order, Product, OrderStatus } from '~/types/Inventory'

const { getOrders, addOrder, updateOrder, deleteOrder } = useOrders()
const { data: orders = ref([]), pending: loading, refresh } = await useAsyncData<Order[]>('orders', () => getOrders())
const { getProducts } = useProducts()
const { data: products } = await useAsyncData<Product[]>('products', () => getProducts(), {
  default: () => []
})

const isFormOpen = ref(false)
const isEditing = ref(false)
const formTitle = ref('Add New Order')
const selectedOrderId = ref<string | null>(null)

// Form data
const form = ref<{
  customerId: string
  productId: string
  quantity: number
  status: OrderStatus
}>({
  customerId: '',
  productId: '',
  quantity: 1,
  status: 'pending'
})

const selectedProduct = computed(() =>
  products.value.find(p => p.id === form.value.productId)
)

const computedTotalPrice = computed(() =>
  selectedProduct.value?.price ? selectedProduct.value.price * form.value.quantity : 0
)

// Open form for adding
const openAddForm = () => {
  formTitle.value = 'Add New Order'
  form.value = {
    customerId: '',
    productId: '',
    quantity: 1,
    status: 'pending'
  }
  isEditing.value = false
  isFormOpen.value = true
}

// Open form for editing
const openEditForm = (order: Order) => {
  formTitle.value = 'Update Order'
  form.value = {
    customerId: order.customerId,
    productId: order.productId,
    quantity: order.quantity,
    status: order.status || 'pending'
  }
  selectedOrderId.value = order.id
  isEditing.value = true
  isFormOpen.value = true
}

// Submit form
const handleSubmit = async () => {
  try {
    if (isEditing.value && selectedOrderId.value) {
      await updateOrder(selectedOrderId.value, form.value)
    } else {
      await addOrder(form.value)
    }
    await refresh()
    isFormOpen.value = false
  } catch (error) {
    console.error('Error submitting order form', error)
  }
}

// Delete order
const handleDelete = async (id: string) => {
  try {
    await deleteOrder(id)
    await refresh()
  } catch (error) {
    console.error('Error deleting order', error)
  }
}

const getProductNameById = (productId: string) => {
  const product = products.value.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

const getProductTotal = (order: Order) => {
  const product = products.value.find(p => p.id === order.productId)
  return product ? (product.price * order.quantity).toFixed(2) : '0.00'
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Order Management</h1>

    <!-- Add Order Button -->
    <div class="mb-8">
      <button @click="openAddForm" class="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
        Add New Order
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-gray-500">Loading...</div>

    <!-- No Orders State -->
    <div v-else-if="!orders || orders.length === 0" class="text-gray-500">No orders available.</div>

    <!-- Orders List -->
    <div v-else>
      <ul class="space-y-4">
        <li v-for="order in orders" :key="order.id" class="p-6 bg-white shadow-lg rounded-lg flex justify-between items-center">
          <div class="text-lg font-semibold">Order for: {{ getProductNameById(order.productId) }}</div>
          <div class="flex items-center gap-4">
            <div><strong>Qty:</strong> {{ order.quantity }}</div>
            <div><strong>Total:</strong> ${{ getProductTotal(order) }}</div>
            <div><strong>Status:</strong> {{ order.status }}</div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEditForm(order)"
              class="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              @click="handleDelete(order.id)"
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
          <!-- NEW: Customer ID -->
          <div>
            <label class="block text-sm font-medium mb-1">Customer ID</label>
            <input v-model="form.customerId" type="text" class="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Product</label>
            <select v-model="form.productId" class="w-full border rounded px-3 py-2" required>
              <option disabled value="">-- Select Product --</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name || product.id }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Quantity</label>
            <input v-model.number="form.quantity" type="number" min="1" class="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Total Price</label>
            <input :value="computedTotalPrice" readonly class="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
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
