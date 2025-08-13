<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useAuth } from '~/composables/auth/useAuth'
import { useStocks } from '~/composables/inventory/useStocks'
import { useProducts } from '~/composables/inventory/useProducts'
import type { Product } from '~/types/Product'
import { useToast } from '~/composables/utils/useToast'

const { getStocks, addStock, subtractStock, getStockHistory } = useStocks()
const { getProducts } = useProducts()
const { currentUser } = useAuth()
const { addToast } = useToast()

const userId = computed(() => currentUser.value?.id ?? '')

const products = ref<Product[]>([])
const stocks = ref<any[]>([])

const loadingProducts = ref(false)
const loadingStocks = ref(false)

const fetchProducts = async () => {
  loadingProducts.value = true
  try {
    products.value = await getProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
  } finally {
    loadingProducts.value = false
  }
}

const fetchStocks = async () => {
  loadingStocks.value = true
  try {
    stocks.value = await getStocks()
  } catch (error) {
    console.error('Error fetching stocks:', error)
    stocks.value = []
  } finally {
    loadingStocks.value = false
  }
}

watch(userId, async (id) => {
  if (id) {
    await fetchProducts()
    await fetchStocks()
  } else {
    products.value = []
    stocks.value = []
  }
}, { immediate: true })

const processing = ref(false)
const isHistoryModalOpen = ref(false)
const selectedProductHistory = ref<any[]>([])
const selectedProductName = ref('')

// Separate forms for add and subtract stock to reduce user error
const addStockForm = reactive({
  productId: '',
  quantity: 0,
  note: ''
})
const subtractStockForm = reactive({
  productId: '',
  quantity: 0,
  note: ''
})

const isAddFormValid = computed(() => addStockForm.productId !== '' && addStockForm.quantity > 0)
const isSubtractFormValid = computed(() => subtractStockForm.productId !== '' && subtractStockForm.quantity > 0)

const resetAddForm = () => {
  addStockForm.productId = ''
  addStockForm.quantity = 0
  addStockForm.note = ''
}
const resetSubtractForm = () => {
  subtractStockForm.productId = ''
  subtractStockForm.quantity = 0
  subtractStockForm.note = ''
}

const handleAddStock = async (e: Event) => {
  e.preventDefault()
  if (!isAddFormValid.value) return
  processing.value = true
  try {
    await addStock(addStockForm.productId, addStockForm.quantity, addStockForm.note)
    await fetchStocks()
    resetAddForm()
    addToast('Stock added successfully', 'success')
  } catch (error) {
    console.error('Error adding stock:', error)
    addToast('Failed to add stock', 'error')
  } finally {
    processing.value = false
  }
}

const handleSubtractStock = async (e: Event) => {
  e.preventDefault()
  if (!isSubtractFormValid.value) return
  processing.value = true
  try {
    await subtractStock(subtractStockForm.productId, subtractStockForm.quantity, subtractStockForm.note)
    await fetchStocks()
    resetSubtractForm()
    addToast('Stock subtracted successfully', 'success')
  } catch (error) {
    console.error('Error subtracting stock:', error)
    addToast('Failed to subtract stock', 'error')
  } finally {
    processing.value = false
  }
}

// Filter stocks supaya hanya yg produknya ada di products yang tampil
const validStocks = computed(() => {
  const productIds = new Set(products.value.map(p => p.id))
  return stocks.value.filter(stock => productIds.has(stock.productId))
})

const viewStockChangeHistory = async (productId: string) => {
  try {
    const history = await getStockHistory(productId)
    selectedProductHistory.value = history
    selectedProductName.value = getProductName(productId)
    isHistoryModalOpen.value = true
  } catch (error) {
    console.error('Error fetching stock history:', error)
    addToast('Failed to load stock history', 'error')
  }
}

const closeModal = () => {
  isHistoryModalOpen.value = false
  selectedProductHistory.value = []
  selectedProductName.value = ''
}

const getProductName = (id: string) => {
  return products.value.find(p => p.id === id)?.name || 'Unknown Product'
}
</script>

<template>
  <div class="p-6 sm:p-8 bg-gray-50 min-h-screen max-w-5xl mx-auto">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/dashboard/inventory"
      class="inline-flex items-center px-4 py-2 mb-6 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>

    <h1 class="text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">Stock Management</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <!-- Add Stock Form -->
      <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-5 text-gray-900">Add Stock</h2>
        <form @submit="handleAddStock" class="space-y-5">
          <div>
            <label for="add-productId" class="block mb-1 font-medium text-gray-700">Product</label>
            <select
              id="add-productId"
              v-model="addStockForm.productId"
              class="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option disabled value="">Select a product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="add-quantity" class="block mb-1 font-medium text-gray-700">Quantity</label>
            <input
              id="add-quantity"
              v-model.number="addStockForm.quantity"
              type="number"
              min="1"
              class="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity"
              required
            />
          </div>
          <div>
            <label for="add-note" class="block mb-1 font-medium text-gray-700">Note (optional)</label>
            <textarea
              id="add-note"
              v-model="addStockForm.note"
              rows="3"
              class="w-full rounded-md border border-gray-300 p-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a note..."
            ></textarea>
          </div>
          <button
            type="submit"
            :disabled="processing || !isAddFormValid"
            class="w-full py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg v-if="processing" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Add Stock
          </button>
        </form>
      </section>

      <!-- Subtract Stock Form -->
      <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-5 text-gray-900">Subtract Stock</h2>
        <form @submit="handleSubtractStock" class="space-y-5">
          <div>
            <label for="subtract-productId" class="block mb-1 font-medium text-gray-700">Product</label>
            <select
              id="subtract-productId"
              v-model="subtractStockForm.productId"
              class="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option disabled value="">Select a product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="subtract-quantity" class="block mb-1 font-medium text-gray-700">Quantity</label>
            <input
              id="subtract-quantity"
              v-model.number="subtractStockForm.quantity"
              type="number"
              min="1"
              class="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter quantity"
              required
            />
          </div>
          <div>
            <label for="subtract-note" class="block mb-1 font-medium text-gray-700">Note (optional)</label>
            <textarea
              id="subtract-note"
              v-model="subtractStockForm.note"
              rows="3"
              class="w-full rounded-md border border-gray-300 p-2 resize-y focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Add a note..."
            ></textarea>
          </div>
          <button
            type="submit"
            :disabled="processing || !isSubtractFormValid"
            class="w-full py-3 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg v-if="processing" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Subtract Stock
          </button>
        </form>
      </section>
    </div>

    <!-- Stock List -->
    <section class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-5 text-gray-900">Stock List</h2>

      <div v-if="loadingStocks || loadingProducts" class="flex justify-center py-12">
        <svg class="animate-spin h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </div>

      <div v-else-if="validStocks.length === 0" class="text-center text-gray-400 py-10">
        No stocks available.
      </div>

      <ul v-else class="divide-y">
        <li
          v-for="stock in validStocks"
          :key="stock.id"
          class="py-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 rounded-md transition"
        >
          <div>
            <p class="text-lg font-semibold text-gray-800">{{ getProductName(stock.productId) }}</p>
            <p class="text-sm text-gray-600">Quantity: <span class="font-medium">{{ stock.quantity }}</span></p>
          </div>
          <button
            @click="() => viewStockChangeHistory(stock.productId)"
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            View History
          </button>
        </li>
      </ul>
    </section>

    <!-- Modal for Viewing History -->
    <transition name="fade">
      <div
        v-if="isHistoryModalOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div
          class="bg-white max-w-3xl w-full rounded-lg shadow-lg p-6 overflow-y-auto max-h-[80vh] relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h3 id="modal-title" class="text-2xl font-bold mb-4 text-gray-900">
            Stock History for {{ selectedProductName }}
          </h3>

          <div v-if="selectedProductHistory.length === 0" class="text-gray-500 py-10 text-center">
            No history available.
          </div>

          <ul v-else class="divide-y max-h-[60vh] overflow-y-auto">
            <li v-for="(entry, index) in selectedProductHistory" :key="index" class="py-4">
              <div class="flex justify-between items-center">
                <div class="space-y-1">
                  <p class="text-sm text-gray-600">
                    <strong>Date:</strong>
                    {{
                      new Date(entry.timestamp._seconds * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }}
                  </p>
                  <p class="text-sm text-gray-600"><strong>Quantity:</strong> {{ entry.quantity }}</p>
                  <p class="text-sm">
                    <strong>Change:</strong>
                    <span :class="entry.changeType === 'add' ? 'text-green-600' : 'text-red-600'">
                      {{ entry.changeType === 'add' ? '+' : '-' }}{{ entry.quantity }}
                    </span>
                  </p>
                  <p class="text-sm text-gray-600"><strong>Note:</strong> {{ entry.note || '-' }}</p>
                </div>
              </div>
            </li>
          </ul>

          <button
            @click="closeModal"
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
