<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '~/composables/inventory/useProducts'
import { useCategories } from '~/composables/inventory/useCategories'
import { useAuth } from '~/composables/auth/useAuth'
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
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8 space-y-10">
    <!-- Loading Skeleton -->
    <div v-if="loadingAll" class="animate-pulse">
      <div class="h-10 w-40 bg-gray-300 rounded mb-6"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="n in 4" :key="n" class="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
          <div class="h-10 w-10 bg-gray-300 rounded"></div>
          <div class="h-6 bg-gray-300 rounded w-3/4"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow border border-gray-200 mt-10">
        <div class="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <ul class="space-y-6">
          <li v-for="n in 3" :key="n" class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gray-200 rounded"></div>
            <div class="flex-1 space-y-3">
              <div class="h-4 bg-gray-300 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div class="flex flex-col items-end space-y-3">
              <div class="h-6 w-20 bg-gray-300 rounded-full"></div>
              <div class="h-4 w-16 bg-gray-200 rounded-full"></div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Back Button -->
      <NuxtLink
        to="/admin/dashboard"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
      >
        <ArrowLeft class="w-4 h-4" /> Back to Dashboard
      </NuxtLink>

      <!-- Title -->
      <h1 class="mt-4 mb-8 text-3xl font-bold text-gray-800">Inventory Management</h1>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center justify-between space-x-4 hover:shadow-lg transition"
        >
          <component :is="stat.icon" class="w-12 h-12 text-blue-600 flex-shrink-0" />
          <div class="text-right">
            <div class="text-4xl font-extrabold text-blue-700 leading-none">{{ stat.value }}</div>
            <div class="mt-1 text-gray-700 text-lg font-semibold">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Recent Products -->
      <section class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 class="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
          <Box class="w-5 h-5" /> Recent Products
        </h2>

        <div v-if="recentProducts.length > 0" class="overflow-x-auto -mx-4 px-4 py-2">
          <ul class="flex gap-6 min-w-[600px]">
            <li
              v-for="product in recentProducts"
              :key="product.id"
              class="flex-shrink-0 w-72 p-4 flex flex-col bg-gray-50 rounded-lg shadow hover:shadow-md transition duration-200"
              :class="{ 'opacity-50': !product.isActive }"
            >
              <img
                :src="product.imageUrl"
                alt="Product image"
                class="w-full h-40 object-cover rounded border border-gray-300 mb-4"
                loading="lazy"
              />
              <div class="flex flex-col flex-grow justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate" :title="product.name">{{ product.name }}</h3>
                  <p class="text-sm text-gray-500 mb-1">
                    SKU: {{ product.sku }} • Rp {{ product.formattedPrice }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Category: {{ categoryMap[product.categoryId] || 'Unknown' }}
                  </p>
                </div>
                <div class="mt-3 flex flex-wrap items-center gap-2 justify-between text-sm">
                  <span
                    class="font-semibold px-3 py-1 rounded-full"
                    :class="product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                  >
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                    Stock: {{ product.stock }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="text-center py-10 text-gray-400 text-base">No products available.</div>
      </section>

      <!-- Navigation Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-10">
        <button
          @click="goToProducts"
          class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full"
          type="button"
        >
          <Box class="w-5 h-5" /> Manage Products
        </button>
        <button
          @click="goToCategories"
          class="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full"
          type="button"
        >
          <Layers class="w-5 h-5" /> Manage Categories
        </button>
        <button
          @click="goToStocks"
          class="flex items-center justify-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition w-full"
          type="button"
        >
          <BarChart class="w-5 h-5" /> Manage Stocks
        </button>
      </div>
    </div>
  </div>
</template>
