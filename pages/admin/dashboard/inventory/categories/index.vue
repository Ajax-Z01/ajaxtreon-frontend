<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/auth/useAuth'
import { useCategories } from '~/composables/inventory/useCategories'
import type { Category } from '~/types/Category'
import { useToast } from '~/composables/utils/useToast'

const { getCategories, addCategory, deleteCategory, updateCategory } = useCategories()
const { currentUser } = useAuth()
const { addToast } = useToast()

const userId = computed(() => currentUser.value?.id ?? '')

const categories = ref<Category[]>([])
const loading = ref(true)

const fetchCategories = async () => {
  loading.value = true
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
}

watch(userId, async (id) => {
  if (id) {
    await fetchCategories()
  } else {
    categories.value = []
  }
}, { immediate: true })

const newCategoryName = ref('')
const newCategoryDescription = ref('')
const editingCategoryId = ref<string | null>(null)
const editedCategoryName = ref('')
const editedCategoryDescription = ref('')

const currentUserId = computed(() => currentUser.value?.id || null)

const addNewCategory = async (event: Event) => {
  event.preventDefault()
  if (!newCategoryName.value.trim() || !currentUserId.value) return

  try {
    const newCategoryId = await addCategory({
      name: newCategoryName.value,
      description: newCategoryDescription.value,
      createdBy: currentUserId.value,
    })

    categories.value.push({
      id: newCategoryId,
      name: newCategoryName.value,
      description: newCategoryDescription.value,
      createdBy: currentUserId.value,
    })

    newCategoryName.value = ''
    newCategoryDescription.value = ''

    addToast('Category added successfully', 'success')
  } catch (error) {
    console.error('Error adding category:', error)
    addToast('Failed to add category', 'error')
  }
}

const deleteCategoryHandler = async (id: string) => {
  try {
    await deleteCategory(id)
    categories.value = categories.value.filter(cat => cat.id !== id)
    addToast('Category deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting category:', error)
    addToast('Failed to delete category', 'error')
  }
}

const startEditing = (category: Category) => {
  editingCategoryId.value = category.id
  editedCategoryName.value = category.name
  editedCategoryDescription.value = category.description || ''
}

const cancelEditing = () => {
  editingCategoryId.value = null
  editedCategoryName.value = ''
  editedCategoryDescription.value = ''
}

const saveUpdatedCategory = async (category: Category) => {
  if (!editedCategoryName.value.trim()) return

  try {
    await updateCategory(category.id, {
      name: editedCategoryName.value,
      description: editedCategoryDescription.value,
    })

    const target = categories.value.find(cat => cat.id === category.id)
    if (target) {
      target.name = editedCategoryName.value
      target.description = editedCategoryDescription.value
    }

    cancelEditing()
    addToast('Category updated successfully', 'success')
  } catch (error) {
    console.error('Error updating category:', error)
    addToast('Failed to update category', 'error')
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen space-y-10">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/dashboard/inventory"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
    >
      <ArrowLeft class="w-4 h-4" /> Back to Dashboard
    </NuxtLink>

    <!-- Page Title -->
    <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
      <Folder class="w-6 h-6" /> Manage Categories
    </h1>

    <!-- Add Category Form -->
    <section class="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <PlusCircle class="w-5 h-5" /> Add New Category
      </h2>
      <form @submit="addNewCategory" class="space-y-4">
        <div>
          <label for="categoryName" class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input
            id="categoryName"
            v-model="newCategoryName"
            type="text"
            class="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter category name"
            required
          />
        </div>

        <div>
          <label for="categoryDescription" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="categoryDescription"
            v-model="newCategoryDescription"
            class="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter description"
            rows="3"
          ></textarea>
        </div>

        <button
          type="submit"
          class="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow"
        >
          <Plus class="w-5 h-5" /> Add Category
        </button>
      </form>
    </section>

    <!-- Category List -->
    <section class="bg-white p-6 rounded-xl shadow border border-gray-200">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <List class="w-5 h-5" /> Category List
      </h2>

      <div v-if="loading" class="text-gray-500">Loading categories...</div>
      <div v-else-if="categories?.length === 0" class="text-gray-400">No categories available.</div>

      <ul v-else class="divide-y divide-gray-200">
        <li
          v-for="category in categories"
          :key="category.id"
          class="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <!-- Category Info -->
          <div class="w-full md:flex-1 space-y-2">
            <template v-if="editingCategoryId === category.id">
              <input
                v-model="editedCategoryName"
                type="text"
                class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-400"
              />
              <textarea
                v-model="editedCategoryDescription"
                class="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-400"
                rows="3"
              ></textarea>
            </template>
            <template v-else>
              <div class="text-lg font-semibold text-gray-900">{{ category.name }}</div>
              <p class="text-gray-600 text-sm">{{ category.description }}</p>
            </template>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 shrink-0">
            <template v-if="editingCategoryId === category.id">
              <button
                @click="saveUpdatedCategory(category)"
                class="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <Save class="w-4 h-4" /> Save
              </button>
              <button
                @click="cancelEditing"
                class="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                <X class="w-4 h-4" /> Cancel
              </button>
            </template>
            <template v-else>
              <button
                @click="startEditing(category)"
                class="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                <Pencil class="w-4 h-4" /> Edit
              </button>
              <button
                @click="deleteCategoryHandler(category.id)"
                class="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                <Trash class="w-4 h-4" /> Delete
              </button>
            </template>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
