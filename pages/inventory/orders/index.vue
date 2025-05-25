<script setup lang="ts">
import { ref, computed, toRaw, onMounted } from 'vue'
import { useOrders } from '~/composables/useOrders'
import { useProducts } from '~/composables/useProducts'
import { useUsers } from '~/composables/useUsers'
import type { Order, OrderStatus, OrderItem } from '~/types/Order'
import type { Product } from '~/types/Product'
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

// Form data sesuai tipe baru (multi items)
const form = ref<{
  customerId: string
  items: OrderItem[]
  status: OrderStatus
}>({
  customerId: '',
  items: [],
  status: 'pending'
})

// Tambah / hapus item di order form
const addItemToOrder = () => {
  form.value.items.push({
    productId: '',
    quantity: 1,
    unitPrice: 0
  })
}

const removeItemFromOrder = (index: number) => {
  form.value.items.splice(index, 1)
}

const computedTotalAmount = computed(() =>
  form.value.items.reduce((total, item) => {
    const product = products.value.find(p => p.id === item.productId)
    const price = product?.price || 0
    item.unitPrice = price
    return total + price * item.quantity
  }, 0)
)

const openAddForm = () => {
  formTitle.value = 'Add New Order'
  form.value = {
    customerId: '',
    items: [],
    status: 'pending'
  }
  isEditing.value = false
  selectedOrderId.value = null
  isFormOpen.value = true
}

const openEditForm = (order: Order) => {
  formTitle.value = 'Update Order'
  form.value = {
    customerId: order.customerId,
    items: order.items.map(item => ({ ...item })),
    status: order.status || 'pending'
  }
  selectedOrderId.value = order.id
  isEditing.value = true
  isFormOpen.value = true
}

// Submit form
const handleSubmit = async () => {
  try {
    const payload = {
      customerId: form.value.customerId,
      items: toRaw(form.value.items),
      totalAmount: computedTotalAmount.value,
      status: form.value.status
    }

    if (isEditing.value && selectedOrderId.value) {
      await updateOrder(selectedOrderId.value, payload)
    } else {
      await addOrder(payload)
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

const getCustomerNameById = (id: string) => {
  const user = users.value.find(u => u.id === id)
  return user ? user.name || user.email : 'Unknown Customer'
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/inventory"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>

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
        <li
          v-for="order in orders"
          :key="order.id"
          class="p-6 bg-white shadow-lg rounded-lg flex flex-col gap-2"
        >
          <div class="font-semibold">Customer: {{ getCustomerNameById(order.customerId) }}</div>
          <ul class="ml-4 text-sm text-gray-700">
            <li
              v-for="item in order.items"
              :key="item.productId"
            >
              {{ getProductNameById(item.productId) }} × {{ item.quantity }} = ${{ (item.unitPrice * item.quantity).toFixed(2) }}
            </li>
          </ul>
          <div class="font-semibold">Total: ${{ order.totalAmount.toFixed(2) }}</div>
          <div><strong>Status:</strong> {{ order.status }}</div>
          <div class="flex gap-2 mt-2">
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
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg max-h-[90vh] overflow-auto">
        <h2 class="text-xl font-bold mb-4">{{ formTitle }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Customer -->
          <div>
            <label class="block text-sm font-medium mb-1">Customer</label>
            <select v-model="form.customerId" class="w-full border rounded px-3 py-2" required>
              <option disabled value="">-- Select Customer --</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name || user.email }}
              </option>
            </select>
          </div>

          <!-- Order Items -->
          <div v-for="(item, index) in form.items" :key="index" class="border p-3 rounded mb-3">
            <div class="flex items-center gap-2 mb-2">
              <select v-model="item.productId" class="flex-1 border rounded px-3 py-2" required>
                <option disabled value="">-- Select Product --</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
              <input
                type="number"
                v-model.number="item.quantity"
                min="1"
                class="w-24 border rounded px-3 py-2"
                required
              />
              <button
                type="button"
                @click="removeItemFromOrder(index)"
                class="text-red-500 hover:underline"
                v-if="form.items.length > 1"
              >
                Remove
              </button>
            </div>
            <div class="text-sm text-gray-500">
              Unit Price: ${{ products.find(p => p.id === item.productId)?.price || 0 }}
            </div>
          </div>

          <!-- Add Item Button -->
          <button
            type="button"
            @click="addItemToOrder"
            class="mb-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Add Item
          </button>

          <!-- Total Price -->
          <div>
            <label class="block text-sm font-medium mb-1">Total Price</label>
            <input
              :value="computedTotalAmount.toFixed(2)"
              readonly
              class="w-full border rounded px-3 py-2 bg-gray-100"
            />
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
            <button
              type="button"
              @click="isFormOpen = false"
              class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
