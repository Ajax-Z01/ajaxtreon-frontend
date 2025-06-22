<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '~/composables/useProducts'
import { useCategories } from '~/composables/useCategories'
import { useAuth } from '~/composables/useAuth'
import { Package, FolderKanban, CheckCircle2, XCircle, ArrowLeft, Box, Layers, BarChart } from 'lucide-vue-next'

const router = useRouter()
const { getProducts } = useProducts()
const { getCategories } = useCategories()
const { currentUser } = useAuth()

const { data: allData, pending: loadingAll, refresh, execute } = await useLazyAsyncData(
  'products-categories',
  async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(),
      getCategories()
    ])
    return { products: productsRes, categories: categoriesRes }
  },
  {
    watch: [() => currentUser.value?.id],
    default: () => ({ products: [], categories: [] })
  }
)

const products = computed(() => allData.value?.products ?? [])
const categories = computed(() => allData.value?.categories ?? [])

const stats = computed(() => {
  const total = products.value.length
  const active = products.value.filter(p => p.isActive).length
  const inactive = total - active

  return [
    { label: 'Products', value: total, icon: Package },
    { label: 'Categories', value: categories.value.length, icon: FolderKanban },
    { label: 'Active Products', value: active, icon: CheckCircle2 },
    { label: 'Inactive Products', value: inactive, icon: XCircle }
  ]
})

const recentProducts = computed(() =>
  [...products.value]
    .filter(p => p.createdAt && '_seconds' in p.createdAt)
    .sort((a, b) => {
      const aTime = (a.createdAt as any)._seconds ?? 0
      const bTime = (b.createdAt as any)._seconds ?? 0
      return bTime - aTime
    })
    .slice(0, 5)
    .map(p => ({
      ...p,
      formattedPrice: p.price.toLocaleString('id-ID')
    }))
)

const categoryMap = computed(() =>
  Object.fromEntries(categories.value.map(c => [c.id, c.name]))
)

const goToProducts = () => router.push('inventory/products')
const goToCategories = () => router.push('inventory/categories')
const goToStocks = () => router.push('inventory/stocks')
</script>

<template>
  <div v-if="loadingAll" class="p-8 bg-gray-50 min-h-screen space-y-10">
    <div class="h-10 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="n in 4" :key="n" class="bg-white p-6 rounded-lg shadow border border-gray-200 animate-pulse space-y-2">
        <div class="h-10 w-10 bg-gray-300 rounded"></div>
        <div class="h-6 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div class="h-6 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
      <ul class="space-y-4">
        <li v-for="n in 3" :key="n" class="flex items-center gap-4 animate-pulse">
          <div class="w-16 h-16 bg-gray-200 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-3 bg-gray-100 rounded w-2/3"></div>
            <div class="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
          <div class="flex flex-col items-end space-y-2">
            <div class="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div class="h-4 w-16 bg-gray-100 rounded-full"></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  
  <div v-else class="p-8 bg-gray-50 min-h-screen space-y-10">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/dashboard"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
    >
      <ArrowLeft class="w-4 h-4" /> Back to Dashboard
    </NuxtLink>

    <!-- Title -->
    <h1 class="text-3xl font-bold text-gray-800">Inventory Management</h1>

    <!-- Statistik -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center justify-between"
      >
        <component :is="stat.icon" class="w-10 h-10 text-blue-500" />
        <div class="text-right">
          <div class="text-4xl font-extrabold text-blue-600">{{ stat.value }}</div>
          <div class="mt-1 text-gray-700 text-lg font-medium">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Produk Terbaru -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Box class="w-5 h-5" /> Recent Products
      </h2>

      <div v-if="recentProducts.length > 0">
        <ul class="divide-y divide-gray-200">
          <li
            v-for="product in recentProducts"
            :key="product.id"
            class="py-4 flex items-center gap-4"
            :class="{ 'opacity-50': !product.isActive }"
          >
            <img
              :src="product.imageUrl"
              class="w-16 h-16 object-cover rounded border border-gray-300"
              alt="Product image"
            />
            <div class="flex-1">
              <div class="text-lg font-semibold text-gray-900">{{ product.name }}</div>
              <div class="text-sm text-gray-500">
                SKU: {{ product.sku }} • Price: Rp{{ product.formattedPrice }} <br />
                Category: {{ categoryMap[product.categoryId] || 'Unknown' }}
              </div>
              <div class="text-sm text-gray-400">By {{ product.createdBy }}</div>
            </div>
            <div class="flex flex-col items-end space-y-1">
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                :class="product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              >
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </span>
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Stock: {{ product.stock }}
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="text-gray-400 text-center py-4">No products available.</div>
    </div>

    <!-- Navigasi -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        @click="goToProducts"
        class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full"
      >
        <Box class="w-5 h-5" /> Manage Products
      </button>
      <button
        @click="goToCategories"
        class="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full"
      >
        <Layers class="w-5 h-5" /> Manage Categories
      </button>
      <button
        @click="goToStocks"
        class="flex items-center justify-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition w-full"
      >
        <BarChart class="w-5 h-5" /> Manage Stocks
      </button>
    </div>
  </div>
</template>
