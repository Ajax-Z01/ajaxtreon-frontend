<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useProducts } from '~/composables/useProducts'
import { useCategories } from '~/composables/useCategories'
import { useCloudinaryUploader } from '~/composables/useCloudinaryUploader'
import AddProductModal from '~/components/modal/CreateProduct.vue'
import EditProductModal from '~/components/modal/EditProduct.vue'
import type { Product, CreateProductPayload, UpdateProductPayload } from '~/types/Product'
import AppProductCard from '~/components/card/AppProductCard.vue'
import { useToast } from '~/composables/useToast'
import { ArrowLeft, PlusCircle } from 'lucide-vue-next'

const { getProducts, addProduct, updateProduct, deleteProduct } = useProducts()
const { getCategories } = useCategories()
const { currentUser } = useAuth()
const { uploadImage } = useCloudinaryUploader()
const { addToast } = useToast()

const userId = computed(() => currentUser.value?.id ?? '')

const { data: allData, pending: loadingAll, refresh, execute } = useLazyAsyncData(
  'products-categories',
  async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(),
      getCategories()
    ])
    return { products: productsRes, categories: categoriesRes }
  },
  {
    default: () => ({ products: [], categories: [] })
  }
)

watch(userId, (id) => {
  if (id) execute()
}, { immediate: true })

const products = computed(() => allData.value?.products ?? [])
const categories = computed(() => allData.value?.categories ?? [])

const loading = loadingAll
const loadingCategories = loadingAll

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
    addToast('Image uploaded successfully', 'success')
  } catch (error) {
    uploadError.value = (error as Error).message || 'Upload failed'
    addToast(uploadError.value, 'error')
  } finally {
    isUploading.value = false
  }
}

const handleSubmit = async () => {
  try {
    if (!userId.value) throw new Error('User not authenticated')

    const payload = {
      ...form,
      createdBy: userId.value
    }

    if (isEditing.value && selectedProductId.value) {
      await updateProduct(selectedProductId.value, payload as UpdateProductPayload)
      addToast('Product updated successfully', 'success')
    } else {
      await addProduct(payload as CreateProductPayload)
      addToast('Product added successfully', 'success')
    }

    await refresh()
    isFormOpen.value = false
  } catch (error) {
    const msg = (error as Error).message || 'Submit failed'
    console.error('Submit error:', msg)
    addToast(msg, 'error')
  }
}

const handleDelete = async (id: string) => {
  try {
    await deleteProduct(id)
    await refresh()
    addToast('Product deleted successfully', 'success')
  } catch (error) {
    const msg = (error as Error).message || 'Delete failed'
    console.error('Error deleting product:', msg)
    addToast(msg, 'error')
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
    <!-- Back to Dashboard Button -->
    <NuxtLink
      to="/admin/dashboard/inventory"
      class="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
    >
      <ArrowLeft class="w-4 h-4" /> Back to Inventory
    </NuxtLink>

    <!-- Title -->
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Product Management</h1>

    <!-- Add Product Button -->
    <button
      @click="openAddForm"
      :disabled="loadingAll"
      class="inline-flex items-center gap-2 p-3 mb-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
    >
      <PlusCircle class="w-5 h-5" /> Add New Product
    </button>

    <!-- Loading Skeleton -->
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
    <div v-else-if="!products?.length || !categories?.length">
      <div class="text-gray-500 flex items-center gap-2">
        <span class="text-xl">⚠️</span> No products available or categories not loaded.
      </div>
    </div>

    <!-- Product Grid -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AppProductCard
          v-for="product in products ?? []"
          :key="product.id"
          :product="product"
          :categories="categories ?? []"
          @edit="openEditForm"
          @delete="confirmDelete"
        />
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
