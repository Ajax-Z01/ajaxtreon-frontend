<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useProducts } from '~/composables/useProducts'
import type { Product } from '~/types/Product'

const router = useRouter()
const { currentUser } = useAuth()
const { getProducts } = useProducts()

const { data: products, pending: loading, refresh } = await useAsyncData<Product[]>(
  'products',
  async () => {
    if (!currentUser.value?.id) return []
    return await getProducts(currentUser.value.id)
  },
  {
    watch: [() => currentUser.value?.id],
    default: () => []
  }
)

const stats = computed(() => {
  const all = products.value || []
  const active = all.filter(p => p.isActive).length
  const inactive = all.filter(p => !p.isActive).length

  return [
    { label: 'Total Products', value: all.length, icon: '📦' },
    { label: 'Active Products', value: active, icon: '✅' },
    { label: 'Inactive Products', value: inactive, icon: '❌' }
  ]
})

const recentProducts = computed(() => products.value?.slice(0, 5) || [])

const goToProducts = () => router.push('inventory/products')
const goToStocks = () => router.push('inventory/stocks')
</script>

<template>
  <div class="p-6 sm:p-8 bg-gray-100 min-h-screen space-y-8">
    <!-- Back -->
    <NuxtLink
      to="/seller/dashboard"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
    >
      <span class="text-lg">←</span>
      Back to Dashboard
    </NuxtLink>

    <h1 class="text-3xl font-bold text-gray-800">Inventory Management</h1>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center space-x-4"
      >
        <div class="text-4xl">{{ stat.icon }}</div>
        <div>
          <div class="text-xl font-bold text-gray-900">{{ stat.value }}</div>
          <div class="text-gray-600">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Products -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200 overflow-x-auto">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        🕒 Recent Products
      </h2>

      <div v-if="recentProducts.length > 0">
        <table class="min-w-full text-sm text-left text-gray-600">
          <thead class="text-xs uppercase bg-gray-100 text-gray-700">
            <tr>
              <th scope="col" class="px-4 py-3">Image</th>
              <th scope="col" class="px-4 py-3">Name</th>
              <th scope="col" class="px-4 py-3">SKU</th>
              <th scope="col" class="px-4 py-3">Price</th>
              <th scope="col" class="px-4 py-3">Stock</th>
              <th scope="col" class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in recentProducts"
              :key="product.id"
              class="bg-white border-b hover:bg-gray-50 transition"
            >
              <td class="px-4 py-3">
                <img
                  :src="product.imageUrl"
                  alt="Product image"
                  class="w-12 h-12 object-cover rounded"
                />
              </td>
              <td class="px-4 py-3 font-medium text-gray-900">{{ product.name }}</td>
              <td class="px-4 py-3">{{ product.sku }}</td>
              <td class="px-4 py-3">Rp {{ product.price.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    product.stock > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    product.isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-200 text-gray-600'
                  ]"
                >
                  {{ product.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-gray-400 text-center py-4">No products available.</div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
      <button
        @click="goToProducts"
        class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        📋 Manage Products
      </button>
      <button
        @click="goToStocks"
        class="flex items-center justify-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
      >
        📦 Manage Stocks
      </button>
    </div>
  </div>
</template>
