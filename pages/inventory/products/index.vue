<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProducts } from '~/composables/useProducts'
import { useCategories } from '~/composables/useCategories'
import type { Product, Category } from '~/types/Inventory'

const { getProducts, addProduct, updateProduct, deleteProduct } = useProducts()
const { getCategories } = useCategories()

const { data: products, pending: loading, refresh } = await useAsyncData<Product[]>('products', () => getProducts())
const { data: categories, pending: loadingCategories } = await useAsyncData<Category[]>('categories', () => getCategories())

const isFormOpen = ref(false)
const isEditing = ref(false)
const formTitle = ref('Add New Product')
const selectedProductId = ref<string | null>(null)
const safeProducts = computed(() => products.value ?? [])

// Form data
const form = ref({
  name: '',
  price: 0,
  stock: 0,
  categoryId: ''
})

// Open form for adding
const openAddForm = () => {
  formTitle.value = 'Add New Product'
  form.value = { name: '', price: 0, stock: 0, categoryId: '' }
  isEditing.value = false
  isFormOpen.value = true
}

// Open form for editing
const openEditForm = (product: Product) => {
  formTitle.value = 'Update Product'
  form.value = { name: product.name, price: product.price, stock: product.stock, categoryId: product.categoryId } // Pastikan categoryId terisi saat edit
  selectedProductId.value = product.id
  isEditing.value = true
  isFormOpen.value = true
}

// Submit form
const handleSubmit = async () => {
  try {
    if (isEditing.value && selectedProductId.value) {
      await updateProduct(selectedProductId.value, form.value)
    } else {
      await addProduct(form.value)
    }
    await refresh()
    isFormOpen.value = false
  } catch (error) {
    console.error('Error submitting form', error)
  }
}

// Delete product
const handleDelete = async (id: string) => {
  try {
    await deleteProduct(id)
    await refresh()
  } catch (error) {
    console.error('Error deleting product', error)
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/inventory"
      class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      ← Back to Dashboard
    </NuxtLink>
    
    <h1 class="text-3xl font-bold mb-6">Product Management</h1>

    <!-- Add Product Button -->
    <div class="mb-8">
      <button @click="openAddForm" class="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
        Add New Product
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-gray-500">Loading...</div>

    <!-- No Products State -->
    <div v-else-if="!products || products.length === 0" class="text-gray-500">No products available.</div>
    
    <!-- Product List -->
    <div v-else>
      <ul class="space-y-4">
        <li v-for="product in safeProducts" :key="product.id">
          <div class="text-lg font-semibold">{{ product.name }}</div>
          <div class="flex items-center gap-4">
            <div><strong>Price:</strong> ${{ product.price }}</div>
            <div><strong>Stock:</strong> {{ product.stock }}</div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEditForm(product)"
              class="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Edit
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

    <!-- Modal Form -->
    <div v-if="isFormOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 class="text-xl font-bold mb-4">{{ formTitle }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Price</label>
            <input v-model.number="form.price" type="number" class="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Stock</label>
            <input v-model.number="form.stock" type="number" class="w-full border rounded px-3 py-2" required />
          </div>
          <!-- Category Select -->
          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <select v-model="form.categoryId" class="w-full border rounded px-3 py-2" required>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="isFormOpen = false" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
