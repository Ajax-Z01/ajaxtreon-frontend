<script setup lang="ts">
import { ref } from 'vue'
import type { Category } from '~/types/Category'
import type { CreateProductPayload } from '~/types/Product'
import { useCloudinaryUploader } from '~/composables/utils/useCloudinaryUploader'
import { PlusCircle, X, Upload, Image as ImageIcon } from 'lucide-vue-next'

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
    class="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-center justify-center px-4 py-6"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto p-6 relative">
      <!-- Close button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Title -->
      <div class="flex items-center gap-2 mb-6">
        <PlusCircle class="w-6 h-6 text-blue-600" />
        <h2 class="text-2xl font-bold text-gray-800">Add New Product</h2>
      </div>

      <form @submit.prevent="submit" class="space-y-5">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium mb-1">Name</label>
          <input v-model="props.form.name" type="text" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" required />
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium mb-1">Price</label>
          <input v-model.number="props.form.price" type="number" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" required />
        </div>
        
        <!-- Cost Price -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Cost Price
            <span class="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            v-model.number="props.form.costPrice"
            type="number"
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 5000"
            min="0"
          />
        </div>

        <!-- Stock -->
        <div>
          <label class="block text-sm font-medium mb-1">Stock</label>
          <input v-model.number="props.form.stock" type="number" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" required />
        </div>

        <!-- SKU -->
        <div>
          <label class="block text-sm font-medium mb-1">SKU</label>
          <input v-model="props.form.sku" type="text" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea v-model="props.form.description" rows="3" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <!-- Image Upload -->
        <div>
          <label class="text-sm font-medium mb-1 flex items-center gap-2">
            <Upload class="w-4 h-4" /> Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            @change="(e) => handleFileChange((e.target as HTMLInputElement).files?.[0]!)"
            class="block mb-2"
          />
          <div v-if="isUploading" class="text-sm text-blue-600 mb-1">Uploading image...</div>
          <div v-if="uploadError" class="text-sm text-red-600 mb-1">{{ uploadError }}</div>

          <div v-if="props.form.imageUrl" class="flex items-center gap-3 mb-2">
            <img :src="props.form.imageUrl" class="max-h-24 border rounded shadow-sm" />
            <span class="text-gray-600 text-sm">{{ props.form.imageUrl.split('/').pop() }}</span>
          </div>

          <input
            v-model="props.form.imageUrl"
            type="text"
            readonly
            class="w-full border rounded px-3 py-2 bg-gray-100 text-sm"
          />
        </div>

        <!-- Active Checkbox -->
        <div class="flex items-center gap-2">
          <input v-model="props.form.isActive" type="checkbox" id="isActive" />
          <label for="isActive" class="text-sm font-medium">Active</label>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium mb-1">Category</label>
          <select v-model="props.form.categoryId" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
            <option v-for="category in props.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isUploading"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <PlusCircle class="w-4 h-4" /> Add Product
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
