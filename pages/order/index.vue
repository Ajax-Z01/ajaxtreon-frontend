<script setup lang="ts">
import { ref, computed, toRaw } from 'vue'
import { useOrders } from '~/composables/useOrders'
import { useProducts } from '~/composables/useProducts'
import { useUsers } from '~/composables/useUsers'
import type { Order, OrderStatus } from '~/types/Order'
import type { Product } from '~/types/Inventory'
import type { User } from '~/types/User'

const { getOrders, addOrder, updateOrder, deleteOrder } = useOrders()
const { getProducts } = useProducts()
const { getUsers } = useUsers()

const { data: orders = ref([]), pending: loading, refresh } = useAsyncData<Order[]>('orders', getOrders, { default: () => [] })
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
const formTitle = ref('Add New Order')
const selectedOrderId = ref<string | null>(null)

// Form data
const form = ref<{
  customerId: string
  productId: string
  quantity: number
  totalPrice?: number
  status: OrderStatus
}>({
  customerId: '',
  productId: '',
  quantity: 1,
  totalPrice: 0,
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
    totalPrice: 0,
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
    totalPrice: order.totalPrice,
    status: order.status || 'pending'
  }
  selectedOrderId.value = order.id
  isEditing.value = true
  isFormOpen.value = true
}

// Submit form
const handleSubmit = async () => {
  try {
    const rawFormData = toRaw(form.value)  // Convert to plain object
    rawFormData.totalPrice = computedTotalPrice.value // Add totalPrice to raw form data
    console.log('Raw Form Data with Total Price:', rawFormData)

    if (isEditing.value && selectedOrderId.value) {
      await updateOrder(selectedOrderId.value, rawFormData)  // Use rawFormData here
    } else {
      await addOrder(rawFormData)  // Use rawFormData here
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

const getCustomerNameById = (id: string) => {
  const user = users.value.find(u => u.id === id)
  return user ? user.name || user.email : 'Unknown Customer'
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/dashboard"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>
    
    <h1 class="text-3xl font-bold mb-6">Order Management</h1>

    <!-- Add Order Button -->
    <div class="mb-4 text-right">
      <button
        @click="openAddForm" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Payment
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
          <div class="text-lg font-semibold">
            Order by: {{ getCustomerNameById(order.customerId) }}
          </div>
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
          <!-- Customer ID -->
          <div>
            <label class="block text-sm font-medium mb-1">Customer</label>
            <select v-model="form.customerId" class="w-full border rounded px-3 py-2" required>
              <option disabled value="">-- Select Customer --</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name || user.email || user.id }}
              </option>
            </select>
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
