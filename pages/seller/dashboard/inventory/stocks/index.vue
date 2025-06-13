<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useStocks } from '~/composables/useStocks'
import { useProducts } from '~/composables/useProducts'

const { getStocks, addStock, subtractStock, getStockHistory } = useStocks()
const { getProducts } = useProducts()

// Fetch stocks & products with SSR support
const { data: stocksData, refresh: refreshStocks, pending: loadingStocks } = await useAsyncData('stocks', getStocks)
const { data: productsData, refresh: refreshProducts } = await useAsyncData('products', getProducts)

const processing = ref(false)
const isHistoryModalOpen = ref(false)
const selectedProductHistory = ref<any[]>([])
const selectedProductName = ref('')

const stockForm = reactive({
  productId: '',
  quantity: 0,
  note: ''
})

const isValidForm = computed(() => {
  return stockForm.productId !== '' && stockForm.quantity > 0
})

const resetForm = () => {
  stockForm.productId = ''
  stockForm.quantity = 0
  stockForm.note = ''
}

const handleStockChange = async (type: 'add' | 'subtract', event: Event) => {
  event.preventDefault()
  if (!isValidForm.value) return

  try {
    processing.value = true
    if (type === 'add') {
      await addStock(stockForm.productId, stockForm.quantity, stockForm.note)
    } else {
      await subtractStock(stockForm.productId, stockForm.quantity, stockForm.note)
    }
    await refreshStocks()
    resetForm()
    // TODO: Show success toast
  } catch (error) {
    console.error(`Error ${type === 'add' ? 'adding' : 'subtracting'} stock:`, error)
    // TODO: Show error toast
  } finally {
    processing.value = false
  }
}

const viewStockChangeHistory = async (productId: string) => {
  try {
    const history = await getStockHistory(productId)
    selectedProductHistory.value = history
    selectedProductName.value = getProductName(productId)
    isHistoryModalOpen.value = true
  } catch (error) {
    console.error('Error fetching stock history:', error)
  }
}

const closeModal = () => {
  isHistoryModalOpen.value = false
  selectedProductHistory.value = []
  selectedProductName.value = ''
}

const getProductName = (id: string) => {
  return productsData.value?.find(p => p.id === id)?.name || 'Unknown Product'
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/dashboard/inventory"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>

    <h1 class="text-3xl font-bold mb-6">Stocks</h1>

    <!-- Form -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">Manage Stock</h2>
      <form @submit="(e) => handleStockChange('add', e)">
        <div class="mb-4">
          <label for="productId" class="block text-sm font-medium text-gray-700">Product</label>
          <select
            v-model="stockForm.productId"
            class="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
            required
          >
            <option disabled value="">Select a product</option>
            <option v-for="product in productsData" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            id="quantity"
            v-model.number="stockForm.quantity"
            type="number"
            class="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter quantity"
            required
          />
        </div>
        <div class="mb-4">
          <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            id="note"
            v-model="stockForm.note"
            class="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter a note (optional)"
          ></textarea>
        </div>
        <div class="space-x-4">
          <button
            type="submit"
            :disabled="processing"
            class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Add Stock
          </button>
          <button
            type="button"
            :disabled="processing"
            @click="(e) => handleStockChange('subtract', e)"
            class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            Subtract Stock
          </button>
        </div>
      </form>
    </div>

    <!-- Stock List -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Stock List</h2>

      <div v-if="loadingStocks" class="text-gray-500">Loading...</div>
      <div v-else-if="!stocksData || stocksData.length === 0" class="text-gray-400">No stocks available.</div>
      <div v-else>
        <ul class="divide-y">
          <li v-for="stock in stocksData" :key="stock.id" class="py-3 flex justify-between items-center">
            <span class="text-lg font-medium">
              {{ getProductName(stock.productId) }} | Quantity: {{ stock.quantity }}
            </span>
            <button
              @click="() => viewStockChangeHistory(stock.productId)"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              View History
            </button>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Modal for Viewing History -->
    <div v-if="isHistoryModalOpen" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-2xl rounded-lg p-6 shadow-lg relative">
        <h3 class="text-xl font-semibold mb-4">Stock History for {{ selectedProductName }}</h3>

        <div v-if="selectedProductHistory.length === 0" class="text-gray-500">No history available.</div>
        <ul v-else class="divide-y max-h-80 overflow-y-auto">
        <li v-for="(entry, index) in selectedProductHistory" :key="index" class="py-2">
            <div class="flex justify-between items-center">
            <div>
                <p><strong>Date:</strong> {{
                    new Date(entry.timestamp._seconds * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}}
                </p>
                <p><strong>Quantity:</strong> {{ entry.quantity }}</p>
                <p><strong>Change:</strong>
                    <span :class="entry.changeType === 'add' ? 'text-green-600' : 'text-red-600'">
                    {{ entry.changeType === 'add' ? ' +' : ' -' }}{{ entry.quantity }}
                    </span>
                </p>
                <p><strong>Note:</strong> {{ entry.note || '-' }}</p>
            </div>
            </div>
        </li>
        </ul>

        <button @click="closeModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
        ✕
        </button>
    </div>
    </div>
  </div>
</template>
