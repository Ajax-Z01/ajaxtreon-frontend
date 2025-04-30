<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { Product } from '~/types/Inventory'
import { useAuth } from '~/composables/useAuth'
import { useProducts } from '~/composables/useProducts'
import { useCategories } from '~/composables/useCategories'
import { useOrders } from '~/composables/useOrders'

const router = useRouter()
const auth = getAuth()
const { logout } = useAuth()

const stats = ref([
  { label: 'Products', value: 0 },
  { label: 'Categories', value: 0 },
  { label: 'Orders', value: 0 }
])

const recentProducts = ref<Product[]>([])
const user = ref<{ email: string | null, uid: string | null } | null>(null)

const { getProducts } = useProducts()
const { getCategories } = useCategories()
const { getOrders } = useOrders()

const fetchStats = async () => {
  try {
    const products = (await getProducts()) || []
    stats.value[0].value = products.length
    recentProducts.value = products.slice(0, 5)

    const categories = (await getCategories()) || []
    stats.value[1].value = categories.length

    const orders = (await getOrders()) || []
    stats.value[2].value = orders.length
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const logoutUser = async () => {
  await logout()
  router.push('/auth/login')
}

const goToProducts = () => router.push('/products')
const goToCategories = () => router.push('/categories')
const goToOrders = () => router.push('/orders') // Add navigation to Orders

onMounted(() => {
  onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      user.value = {
        email: authUser.email,
        uid: authUser.uid
      }
      await fetchStats()
    } else {
      router.push('/auth/login')
    }
  })
})
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen space-y-8">
    <div class="flex items-center justify-between flex-wrap">
      <h1 class="text-3xl font-bold mb-2">Welcome back, {{ user?.email }}!</h1>
      <button
        @click="logoutUser"
        class="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>

    <!-- Statistik -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div class="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
              ${{ product.price }}
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
        @click="goToOrders"
        class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition"
      >
        Manage Orders
      </button>
    </div>
  </div>
</template>
