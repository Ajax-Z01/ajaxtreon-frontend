<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { Product } from '~/types/Inventory'
import { useAuth } from '~/composables/useAuth'
import { useProducts } from '~/composables/useProducts'
import { useCategories } from '~/composables/useCategories'

const router = useRouter()
const auth = getAuth()
const { logout } = useAuth()

const stats = ref([
  { label: 'Products', value: 0 },
  { label: 'Categories', value: 0 }
])

const recentProducts = ref<Product[]>([])
const user = ref<{ email: string | null, uid: string | null } | null>(null)

const { getProducts } = useProducts()
const { getCategories } = useCategories()

const fetchStats = async () => {
  try {
    const products = await getProducts()
    stats.value[0].value = products.length
    recentProducts.value = products.slice(0, 5)

    const categories = await getCategories()
    stats.value[1].value = categories.length
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
  <div class="p-8 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Welcome back, {{ user?.email }}!</h1>

    <!-- Statistik -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-5xl font-bold text-blue-600">{{ stat.value }}</div>
        <div class="mt-2 text-gray-500">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Produk Terbaru -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">Recent Products</h2>
      <div v-if="recentProducts.length > 0">
        <ul class="divide-y">
          <li v-for="product in recentProducts" :key="product.id" class="py-2">
            <div class="flex justify-between">
              <span class="font-medium">{{ product.name }}</span>
              <span class="text-gray-400 text-sm">${{ product.price }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="text-gray-400">No products available.</div>
    </div>

    <!-- Aksi Navigasi -->
    <div class="flex space-x-4">
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
    </div>
    <button
      @click="logoutUser"
      class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  </div>
</template>
