<script setup lang="ts">
import { ref } from 'vue'
import { useCategories } from '~/composables/useCategories'
import type { Category } from '~/types/Inventory'

const { getCategories, addCategory, deleteCategory, updateCategory } = useCategories()

const { data: categories, pending: loading, refresh } = await useAsyncData<Category[]>('categories', () => getCategories(), {
  default: () => [],
})

const newCategoryName = ref('')
const editingCategoryId = ref<number | null>(null)
const editedCategoryName = ref('')

// Add new category
const addNewCategory = async (event: Event) => {
  event.preventDefault()

  if (!newCategoryName.value.trim()) return

  try {
    const newCategoryId = await addCategory({ name: newCategoryName.value })
    categories.value?.push({ id: newCategoryId, name: newCategoryName.value })
    newCategoryName.value = ''
  } catch (error) {
    console.error('Error adding category:', error)
  }
}

// Delete category
const deleteCategoryHandler = async (id: number) => {
  try {
    await deleteCategory(id)
    categories.value = categories.value?.filter((category) => category.id !== id)
  } catch (error) {
    console.error('Error deleting category:', error)
  }
}

// Start editing
const startEditing = (category: Category) => {
  editingCategoryId.value = category.id
  editedCategoryName.value = category.name
}

// Cancel editing
const cancelEditing = () => {
  editingCategoryId.value = null
  editedCategoryName.value = ''
}

// Save updated category
const saveUpdatedCategory = async (category: Category) => {
  if (!editedCategoryName.value.trim()) return

  try {
    await updateCategory(category.id, { name: editedCategoryName.value })

    const target = categories.value?.find((cat) => cat.id === category.id)
    if (target) {
      target.name = editedCategoryName.value
    }

    editingCategoryId.value = null
    editedCategoryName.value = ''
  } catch (error) {
    console.error('Error updating category:', error)
  }
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Categories</h1>

    <!-- Form Add Category -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">Add New Category</h2>
      <form @submit="addNewCategory">
        <div class="mb-4">
          <label for="categoryName" class="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            id="categoryName"
            v-model="newCategoryName"
            type="text"
            class="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter category name"
            required
          />
        </div>
        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Add Category
        </button>
      </form>
    </div>

    <!-- Categories List -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Category List</h2>

      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="categories?.length === 0" class="text-gray-400">No categories available.</div>
      <div v-else>
        <ul class="divide-y">
          <li v-for="category in categories" :key="category.id" class="py-3 flex justify-between items-center">
            <div class="flex-1">
              <template v-if="editingCategoryId === category.id">
                <input
                  v-model="editedCategoryName"
                  type="text"
                  class="p-2 border border-gray-300 rounded-lg w-full"
                />
              </template>
              <template v-else>
                <span class="text-lg font-medium">{{ category.name }}</span>
              </template>
            </div>
            <div class="space-x-4 flex-shrink-0">
              <template v-if="editingCategoryId === category.id">
                <button
                  @click="saveUpdatedCategory(category)"
                  class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  @click="cancelEditing"
                  class="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </template>
              <template v-else>
                <button
                  @click="startEditing(category)"
                  class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  @click="deleteCategoryHandler(category.id)"
                  class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
