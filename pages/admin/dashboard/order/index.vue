<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrders } from '~/composables/useOrders'
import { useProducts } from '~/composables/useProducts'
import type { Order, OrderItem, OrderStatus, CreateOrderPayload } from '~/types/Order'
import { useCustomers } from '~/composables/useCustomers'
import { useToast } from '~/composables/useToast'
import { useAuth } from '~/composables/useAuth'
import type { Customer } from '~/types/Customer'

const { getOrders, addOrder, updateOrder, deleteOrder } = useOrders()
const { getProducts } = useProducts()
const { getCustomers } = useCustomers()
const { currentUser } = useAuth()
const { addToast } = useToast()

const { data: allData, pending: loadingAll,refresh, execute } = await useLazyAsyncData(
  'products-orders',
  async () => {
    const [productsRes, ordersRes] = await Promise.all([
      getProducts(),
      getOrders()
    ])
    return { products: productsRes, orders: ordersRes }
  },
  {
    watch: [() => currentUser.value?.id],
    default: () => ({ products: [], orders: [] })
  }
)

const products = computed(() => allData.value?.products ?? [])
const orders = computed(() => allData.value?.orders ?? [])
const customers = ref<Customer[]>([])

onMounted(async () => {
  try {
    customers.value = await getCustomers()
  } catch (error) {
    console.error('Error fetching users:', error)
    addToast('Failed to load users.', 'error')
  }
})

const isFormOpen = ref(false)
const isEditing = ref(false)
const formTitle = ref('Add New Order')
const selectedOrderId = ref<string | null>(null)

const form = ref({
  customerId: '',
  productId: '',
  quantity: 1,
  status: 'pending' as OrderStatus,
  discount: 0,
  tax: 0
})

// Helper: Get first order item safely
const getFirstOrderItem = (order: Order): OrderItem | null => {
  if (!order.items || order.items.length === 0) return null
  return order.items[0]
}

// Helpers for UI display
const getProductById = (productId?: string) => {
  if (!productId) return null
  return products.value.find(p => p.id === productId) ?? null
}

const getOrderTotal = (order: Order) => {
  return order.totalAmount.toFixed(2);
}

const getCustomerNameById = (id: string) => {
  const customer = customers.value.find(c => c.id === id)
  return customer ? customer.name || customer.email : 'Unknown Customer'
}

// Computed to find selected product data
const selectedProduct = computed(() =>
  getProductById(form.value.productId)
)

// Compute total price to show in form (read-only)
const computedTotalPrice = computed(() => {
  if (!selectedProduct.value || !form.value.quantity) return 0;

  const unitPrice = selectedProduct.value.price;
  const quantity = form.value.quantity;
  const discount = form.value.discount ?? 0;
  const tax = form.value.tax ?? 0;

  const subtotal = unitPrice * quantity;
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const totalPrice = subtotal - discountAmount + taxAmount;

  return totalPrice > 0 ? totalPrice : 0;
});

// Deep clean object
function cleanObjectDeep(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanObjectDeep)
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      if (obj[key] !== undefined) {
        newObj[key] = cleanObjectDeep(obj[key])
      }
    }
    return newObj
  }
  return obj
}

// Build payload matching backend structure
const buildOrderPayload = (): CreateOrderPayload => {
  if (!form.value.customerId) throw new Error('Customer must be selected')
  if (!form.value.productId) throw new Error('Product must be selected')
  if (form.value.quantity < 1) throw new Error('Quantity must be at least 1')
  if ((form.value.discount ?? 0) < 0 || (form.value.discount ?? 0) > 100) throw new Error('Discount must be between 0 and 100')

  const product = products.value.find(p => p.id === form.value.productId)!
  const quantity = form.value.quantity
  const unitPrice = product.price
  const discount = form.value.discount !== undefined ? form.value.discount : undefined
  const tax = form.value.tax !== undefined ? form.value.tax : undefined

  const discountedPrice = unitPrice * (1 - (discount ?? 0) / 100)
  const taxedPrice = discountedPrice * (1 + (tax ?? 0) / 100)

  const items: OrderItem[] = [
    {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      discount,
      tax,
    }
  ]

  const payload: CreateOrderPayload = {
    customerId: form.value.customerId,
    items,
    totalAmount: taxedPrice * quantity,
  }

  if (form.value.status) payload.status = form.value.status
  if (discount !== undefined) payload.discount = discount
  if (tax !== undefined) payload.tax = tax
  console.log('Payload to send to backend:', JSON.stringify(payload, null, 2))
  return cleanObjectDeep(payload)
}


// Open form for adding new order
const openAddForm = () => {
  formTitle.value = 'Add New Order'
  form.value = {
    customerId: '',
    productId: '',
    quantity: 1,
    status: 'pending',
    discount: 0,
    tax: 0
  }
  isEditing.value = false
  isFormOpen.value = true
}

// Submit handler to send payload to backend
const handleSubmit = async () => {
  try {
    const payload = buildOrderPayload()
    console.log('Payload to send:', payload)

    if (isEditing.value && selectedOrderId.value) {
      await updateOrder(selectedOrderId.value, payload)
      addToast('Order successfully updated!', 'success')
    } else {
      await addOrder(payload)
      addToast('Order successfully created!', 'success')
    }

    await refresh()
    isFormOpen.value = false
  } catch (error) {
    console.error('Error submitting order form:', error)
    addToast('Failed to submit order. Please check the form.', 'error')
  }
}

// Delete order by id
const handleDelete = async (id: string) => {
  try {
    await deleteOrder(id)
    await refresh()
    addToast('Order deleted successfully!', 'success')
  } catch (error) {
    console.error('Error deleting order:', error)
    addToast('Failed to delete order.', 'error')
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

    <h1 class="text-3xl font-bold mb-6">Order Management</h1>

    <!-- Add Order Button -->
    <div class="mb-4 text-right">
      <button
        @click="openAddForm" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add New Order
      </button>
    </div>
    <!-- Loading State -->
    <div v-if="loadingAll" class="text-gray-500">Loading...</div>

    <!-- No Orders State -->
    <div v-else-if="!orders || orders.length === 0" class="text-gray-500">No orders available.</div>

    <!-- Orders List -->
    <div v-else>
      <ul class="space-y-4">
        <li
          v-for="order in orders"
          :key="order.id"
          class="p-6 bg-white shadow-md rounded-lg border border-gray-200"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-2 flex-col md:flex-row md:items-center">
            <div>
              <p class="text-lg font-semibold text-gray-900">
                {{ getCustomerNameById(order.customerId) }}
              </p>
              <p class="text-sm text-gray-600">
                Order ID: {{ order.id }}
              </p>
              <p class="text-sm text-gray-500">
                Ordered At: {{ new Date(order.createdAt).toLocaleString() }}
              </p>
            </div>
            <span
              class="mt-2 md:mt-0 text-sm px-2 py-1 rounded font-medium"
              :class="{
                'bg-yellow-100 text-yellow-800': order.status === 'pending',
                'bg-green-100 text-green-800': order.status === 'completed',
                'bg-red-100 text-red-800': order.status === 'cancelled'
              }"
            >
              {{ order.status.toUpperCase() }}
            </span>
          </div>

          <!-- Items List -->
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-1 font-medium">Items:</p>
            <ul class="space-y-1">
              <li
                v-for="item in order.items"
                :key="item.productId"
                class="text-sm text-gray-800 flex justify-between"
              >
                <span>{{ item.productName }}</span>
                <span>{{ item.quantity }} × ${{ item.unitPrice }}</span>
              </li>
            </ul>
          </div>

          <!-- Total & Delete -->
          <div class="flex justify-between items-center mt-2">
            <div>
              <p class="text-base font-semibold text-gray-900">
                Total: ${{ getOrderTotal(order) }}
              </p>
              <p v-if="order.discount || order.tax" class="text-xs text-gray-500">
                <span v-if="order.discount">Disc: {{ order.discount }}% </span>
                <span v-if="order.tax">Tax: {{ order.tax }}%</span>
              </p>
            </div>
            <button
              @click="handleDelete(order.id)"
              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal Form -->
    <div
      v-if="isFormOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 class="text-xl font-bold mb-4">{{ formTitle }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Customer ID -->
          <div>
            <label class="block text-sm font-medium mb-1">Customer</label>
            <select v-model="form.customerId" class="w-full border rounded px-3 py-2" required>
              <option disabled value="">-- Select Customer --</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name || customer.email || customer.id }}
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
            <input
              v-model.number="form.quantity"
              type="number"
              min="1"
              class="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Total Price</label>
            <input
              :value="computedTotalPrice"
              readonly
              class="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Discount (%)</label>
            <input
              v-model.number="form.discount"
              type="number"
              min="0"
              max="100"
              class="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Tax (%)</label>
            <input
              v-model.number="form.tax"
              type="number"
              min="0"
              class="w-full border rounded px-3 py-2"
            />
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
