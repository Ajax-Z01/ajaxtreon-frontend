<script setup lang="ts">
definePageMeta({
  middleware: ['seller-only']
})
import { ref, computed, reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useProducts } from '~/composables/useProducts'
import { useCategories } from '~/composables/useCategories'
import { useCloudinaryUploader } from '~/composables/useCloudinaryUploader'
import AddProductModal from '~/components/modal/CreateProduct.vue'
import EditProductModal from '~/components/modal/EditProduct.vue'
import type { Product, CreateProductPayload, UpdateProductPayload } from '~/types/Product'
import type { Category } from '~/types/Category'

const { getProducts, addProduct, updateProduct, deleteProduct } = useProducts()
const { getCategories } = useCategories()
const { currentUser } = useAuth()
const { uploadImage } = useCloudinaryUploader()

const { data: products, pending: loading, refresh } = await useAsyncData<Product[]>('products', () => getProducts())
const { data: categories, pending: loadingCategories } = await useAsyncData<Category[]>('categories', () => getCategories())

const isFormOpen = ref(false)
const isEditing = ref(false)
const formTitle = ref('Add New Product')
const selectedProductId = ref<string | null>(null)
const selectedProduct = computed(() => products.value?.find(p => p.id === selectedProductId.value) ?? null)

function createEmptyForm(): CreateProductPayload {
  return {
    name: '',
    price: 0,
    stock: 0,
    categoryId: '',
    description: '',
    imageUrl: '',
    sku: '',
    isActive: true,
    createdBy: ''
  }
}

const form = reactive<CreateProductPayload>(createEmptyForm())

const resetForm = () => {
  const empty = createEmptyForm()
  Object.assign(form, empty)
  selectedProductId.value = null
}

const openAddForm = () => {
  formTitle.value = 'Add New Product'
  resetForm()
  isEditing.value = false
  isFormOpen.value = true
}

const openEditForm = (product: Product) => {
  formTitle.value = 'Update Product'
  Object.assign(form, {
    name: product.name,
    price: product.price,
    stock: product.stock,
    categoryId: product.categoryId,
    description: product.description ?? '',
    imageUrl: product.imageUrl ?? '',
    sku: product.sku ?? '',
    isActive: product.isActive ?? true,
    createdBy: product.createdBy
  })
  selectedProductId.value = product.id
  isEditing.value = true
  isFormOpen.value = true
}

const isUploading = ref(false)
const uploadError = ref<string | null>(null)

const handleFileChange = async (file: File | null) => {
  if (!file) return
  isUploading.value = true
  uploadError.value = null
  try {
    const url = await uploadImage(file)
    form.imageUrl = url
  } catch (error) {
    uploadError.value = (error as Error).message || 'Upload failed'
  } finally {
    isUploading.value = false
  }
}

const handleSubmit = async () => {
  try {
    if (!currentUser.value?.uid) throw new Error('User not authenticated')

    const payload = {
      ...form,
      createdBy: currentUser.value.uid
    }

    if (isEditing.value && selectedProductId.value) {
      await updateProduct(selectedProductId.value, payload as UpdateProductPayload)
    } else {
      await addProduct(payload as CreateProductPayload)
    }

    await refresh()
    isFormOpen.value = false
  } catch (error) {
    console.error('Submit error:', error)
  }
}

const handleDelete = async (id: string) => {
  try {
    await deleteProduct(id)
    await refresh()
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

const confirmDelete = async (id: string) => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    await handleDelete(id)
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <NuxtLink
      to="/seller/dashboard/inventory"
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
    <div v-if="loading">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="animate-pulse p-4 bg-white rounded-xl shadow">
          <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div class="h-40 bg-gray-100 mb-4 rounded"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Products or Categories State -->
    <div v-else-if="!products || products.length === 0 || !categories">
      <div class="text-gray-500">No products available or categories not loaded.</div>
    </div>

    <!-- Product List -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in products ?? []"
          :key="product.id"
          class="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold truncate">{{ product.name }}</h3>
            <span
              class="px-2 py-0.5 text-xs rounded-full"
              :class="product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'"
            >
              {{ product.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="mt-2 h-40 flex items-center justify-center overflow-hidden bg-gray-50 rounded">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              alt="Product image"
              class="object-cover h-full w-full"
            />
            <div v-else class="text-gray-400 text-sm">No Image</div>
          </div>

          <div class="mt-3 space-y-1 text-sm">
            <div><strong>Price:</strong> ${{ product.price }}</div>
            <div><strong>Stock:</strong> {{ product.stock }}</div>
            <div><strong>SKU:</strong> {{ product.sku || '-' }}</div>
            <div><strong>Category:</strong> 
              {{ categories.find(c => c.id === product.categoryId)?.name || '-' }}
            </div>
          </div>

          <div class="mt-4 flex gap-2 justify-end">
            <button
              @click="openEditForm(product)"
              class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(product.id)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Add Product -->
    <AddProductModal
      v-if="isFormOpen && !isEditing"
      :categories="categories ?? []"
      :form="form"
      :isUploading="isUploading"
      :uploadError="uploadError"
      @close="isFormOpen = false"
      @file-change="handleFileChange"
      @submit="handleSubmit"
    />

    <!-- Modal Edit Product -->
    <EditProductModal
      v-if="isFormOpen && isEditing && selectedProduct"
      :form="form"
      :categories="categories ?? []"
      :isUploading="isUploading"
      :uploadError="uploadError"
      @close="isFormOpen = false"
      @file-change="handleFileChange"
      @submit="handleSubmit"
    />
  </div>
</template>
