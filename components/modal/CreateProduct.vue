<script setup lang="ts">
import { ref } from 'vue'
import type { Category } from '~/types/Category'
import type { CreateProductPayload } from '~/types/Product'
import { useCloudinaryUploader } from '~/composables/useCloudinaryUploader'

const props = defineProps<{
  categories: Category[]
  form: CreateProductPayload
  isUploading: boolean
  uploadError: string | null
  onSubmit: (form: CreateProductPayload) => void
}>()

const emit = defineEmits(['close'])

const isUploading = ref(false)
const uploadError = ref<string | null>(null)

const { uploadImage } = useCloudinaryUploader()

const handleFileChange = async (file: File) => {
  isUploading.value = true
  uploadError.value = null
  try {
    const url = await uploadImage(file)
    props.form.imageUrl = url
  } catch (error) {
    uploadError.value = (error as Error).message
  } finally {
    isUploading.value = false
  }
}

const submit = () => {
  props.onSubmit(props.form)
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-center justify-center min-h-screen px-4 py-6">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto p-6">
        <h2 class="text-xl font-bold mb-4">Add New Product</h2>

        <form @submit.prevent="submit" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="props.form.name" type="text" class="w-full border rounded px-3 py-2" required />
          </div>

          <!-- Price -->
          <div>
            <label class="block text-sm font-medium mb-1">Price</label>
            <input v-model.number="props.form.price" type="number" class="w-full border rounded px-3 py-2" required />
          </div>

          <!-- Stock -->
          <div>
            <label class="block text-sm font-medium mb-1">Stock</label>
            <input v-model.number="props.form.stock" type="number" class="w-full border rounded px-3 py-2" required />
          </div>

          <!-- SKU -->
          <div>
            <label class="block text-sm font-medium mb-1">SKU</label>
            <input v-model="props.form.sku" type="text" class="w-full border rounded px-3 py-2" />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="props.form.description" class="w-full border rounded px-3 py-2"></textarea>
          </div>

          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              @change="(e) => handleFileChange((e.target as HTMLInputElement).files?.[0]!)"
              class="mb-2"
            />
            <div v-if="isUploading" class="text-sm text-blue-600 mb-2">Uploading image...</div>
            <div v-if="uploadError" class="text-sm text-red-600 mb-2">{{ uploadError }}</div>
            <div v-if="props.form.imageUrl" class="mb-2">
              <img :src="props.form.imageUrl" alt="Uploaded Image" class="max-h-40 rounded border" />
            </div>
            <input
              v-model="props.form.imageUrl"
              type="text"
              readonly
              class="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <!-- Active -->
          <div class="flex items-center gap-2">
            <input v-model="props.form.isActive" type="checkbox" id="isActive" />
            <label for="isActive" class="text-sm font-medium">Active</label>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <select v-model="props.form.categoryId" class="w-full border rounded px-3 py-2" required>
              <option v-for="category in props.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isUploading"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
