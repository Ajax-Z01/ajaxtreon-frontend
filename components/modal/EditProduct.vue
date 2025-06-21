<script setup lang="ts">
import { watch, ref } from 'vue'
import type { UpdateProductPayload } from '~/types/Product'
import type { Category } from '~/types/Category'
import { useCloudinaryUploader } from '~/composables/useCloudinaryUploader'
import { Pencil, X, UploadCloud } from 'lucide-vue-next'

const props = defineProps<{
  form: UpdateProductPayload
  categories: Category[]
  onSubmit: (form: UpdateProductPayload) => void
}>()

const emit = defineEmits(['close', 'submit', 'file-change'])

const localForm = ref<UpdateProductPayload>({ ...props.form })

watch(() => props.form, (newForm) => {
  localForm.value = { ...newForm }
}, { immediate: true })

const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const { uploadImage } = useCloudinaryUploader()

const handleFileChange = async (file: File | null) => {
  if (!file) return
  isUploading.value = true
  uploadError.value = null
  try {
    const url = await uploadImage(file)
    localForm.value.imageUrl = url
    emit('file-change', url)
  } catch (error) {
    uploadError.value = (error as Error).message || 'Upload failed'
  } finally {
    isUploading.value = false
  }
}

const submit = () => {
  emit('submit', { ...localForm.value })
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
      <div
        class="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto p-6 relative"
      >
        <!-- Tombol Close di kanan atas -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Judul dengan ikon -->
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Pencil class="w-6 h-6 text-blue-600" />
          Update Product
        </h2>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="localForm.name" type="text" class="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Price</label>
            <input v-model.number="localForm.price" type="number" class="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Stock</label>
            <input v-model.number="localForm.stock" type="number" class="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">SKU</label>
            <input v-model="localForm.sku" type="text" class="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="localForm.description" class="w-full border rounded px-3 py-2"></textarea>
          </div>

          <div>
            <label class="text-sm font-medium mb-1 flex items-center gap-1">
              <UploadCloud class="w-4 h-4 text-blue-600" />
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              @change="(e) => handleFileChange((e.target as HTMLInputElement).files?.[0]!)"
              class="mb-2"
            />
            <div v-if="isUploading" class="text-sm text-blue-600 mb-2">Uploading image...</div>
            <div v-if="uploadError" class="text-sm text-red-600 mb-2">{{ uploadError }}</div>
            <div v-if="localForm.imageUrl" class="mb-2">
              <img :src="localForm.imageUrl" alt="Uploaded Image" class="max-h-40 rounded border" />
            </div>
            <input v-model="localForm.imageUrl" type="text" readonly class="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>

          <div class="flex items-center gap-2">
            <input v-model="localForm.isActive" type="checkbox" id="isActive" />
            <label for="isActive" class="text-sm font-medium">Active</label>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <select v-model="localForm.categoryId" class="w-full border rounded px-3 py-2" required>
              <option v-for="category in props.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-2">
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
