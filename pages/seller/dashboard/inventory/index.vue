<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '~/composables/useProducts'
import { useCategories } from '~/composables/useCategories'

const router = useRouter()
const { getProducts } = useProducts()
const { getCategories } = useCategories()

const { data: products = ref([]) } = useAsyncData('products', getProducts, { default: () => [] })
const { data: categories = ref([]) } = useAsyncData('categories', getCategories, { default: () => [] })

const stats = computed(() => [
  { label: 'Products', value: products.value.length },
  { label: 'Categories', value: categories.value.length }
])

const recentProducts = computed(() => products.value.slice(0, 5))

const goToProducts = () => router.push('inventory/products')
const goToCategories = () => router.push('inventory/categories')
const goToStocks = () => router.push('inventory/stocks')
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen space-y-8">
    <NuxtLink
      to="/seller/dashboard"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
    >
      ← Back to Dashboard
    </NuxtLink>
    
    <h1 class="text-3xl font-bold mb-2">Inventory Management</h1>

    <!-- Statistik -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white p-6 rounded-lg shadow text-center border border-gray-200"
      >
        <div class="text-4xl font-extrabold text-blue-600">{{ stat.value }}</div>
        <div class="mt-1 text-gray-700 text-lg font-medium">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Recent Products -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Recent Products</h2>
      <div v-if="recentProducts.length > 0">
        <ul class="divide-y divide-gray-200">
          <li
            v-for="product in recentProducts"
            :key="product.id"
            class="py-3 flex justify-between items-center"
          >
            <div>
              <div class="font-medium text-gray-900">{{ product.name }}</div>
              <div class="text-sm text-gray-500">#{{ product.id }}</div>
            </div>
            <div class="bg-blue-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
              {{ product.stock }}
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="text-gray-400 text-center py-4">No products available.</div>
    </div>

    <!-- Navigasi Aksi -->
    <div class="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
      <button
        @click="goToProducts"
        class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
      >
        Manage Products
      </button>
      <button
        @click="goToCategories"
        class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Manage Categories
      </button>
      <button
        @click="goToStocks"
        class="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
      >
        Manage Stocks
      </button>
    </div>
  </div>
</template>
