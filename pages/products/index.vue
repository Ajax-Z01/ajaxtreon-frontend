<script setup lang="ts">
import { ref, onMounted } from 'vue'
const { getProducts, addProduct, updateProduct, deleteProduct } = useProducts()
import type { Product } from '~/types/Inventory'

const products = ref<Product[]>([])
const loading = ref(false)

const fetchProducts = async () => {
  loading.value = true
  try {
    console.log("Before fetch:", products.value)  // Check before
    products.value = await getProducts()
    console.log("After fetch:", products.value)   // Check after
  } catch (error) {
    console.error("Error fetching products", error)
  } finally {
    loading.value = false
  }
}


const handleAdd = async () => {
  await addProduct({ name: 'New Product', price: 100, stock: 10 })
  await fetchProducts()
}

const handleUpdate = async (id: string) => {
  await updateProduct(id, { name: 'Updated Name', price: 200 })
  await fetchProducts()
}

const handleDelete = async (id: string) => {
  await deleteProduct(id)
  await fetchProducts()
}

onMounted(fetchProducts)
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Product List</h1>

    <button @click="handleAdd" class="mb-4 p-2 bg-blue-500 text-white rounded">Add Product</button>

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <div v-else-if="products.length === 0" class="text-gray-500">No products available.</div>

    <div v-else>
      <div v-for="product in products" :key="product.id" class="mb-4 p-4 border rounded">
        <div><strong>Name:</strong> {{ product.name }}</div>
        <div><strong>Price:</strong> {{ product.price }}</div>
        <div><strong>Stock:</strong> {{ product.stock }}</div>

        <div class="mt-2 flex gap-2">
          <button @click="handleUpdate(product.id)" class="p-2 bg-yellow-400 rounded">Update</button>
          <button @click="handleDelete(product.id)" class="p-2 bg-red-500 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
