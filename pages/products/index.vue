<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProducts } from '~/composables/useProducts'
import type { Product } from '~/types/Inventory'

const { getProducts, addProduct, updateProduct, deleteProduct } = useProducts()

const products = ref<Product[]>([]) // Holds list of products
const loading = ref(false) // Loading state for data fetching

// Fetch products from API on component mount
const fetchProducts = async () => {
  loading.value = true
  try {
    products.value = await getProducts()
  } catch (error) {
    console.error('Error fetching products', error)
  } finally {
    loading.value = false
  }
}

// Handle Add Product
const handleAdd = async () => {
  try {
    await addProduct({ name: 'New Product', price: 100, stock: 10 })
    await fetchProducts()
  } catch (error) {
    console.error('Error adding product', error)
  }
}

// Handle Update Product
const handleUpdate = async (id: string) => {
  try {
    await updateProduct(id, { name: 'Updated Product', price: 200, stock: 20 })
    await fetchProducts()
  } catch (error) {
    console.error('Error updating product', error)
  }
}

// Handle Delete Product
const handleDelete = async (id: string) => {
  try {
    await deleteProduct(id)
    await fetchProducts()
  } catch (error) {
    console.error('Error deleting product', error)
  }
}

// Fetch products when component mounts
onMounted(fetchProducts)
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Product Management</h1>

    <!-- Add Product Button -->
    <div class="mb-8">
      <button @click="handleAdd" class="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
        Add New Product
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-gray-500">Loading...</div>

    <!-- No Products State -->
    <div v-else-if="products.length === 0" class="text-gray-500">No products available.</div>

    <!-- Product List -->
    <div v-else>
      <ul class="space-y-4">
        <li v-for="product in products" :key="product.id" class="p-6 bg-white shadow-lg rounded-lg flex justify-between items-center">
          <div class="text-lg font-semibold">{{ product.name }}</div>
          <div class="flex items-center gap-4">
            <div><strong>Price:</strong> ${{ product.price }}</div>
            <div><strong>Stock:</strong> {{ product.stock }}</div>
          </div>
          <div class="flex gap-2">
            <button
              @click="handleUpdate(product.id)"
              class="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Update
            </button>
            <button
              @click="handleDelete(product.id)"
              class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

