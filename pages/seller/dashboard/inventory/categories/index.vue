<script setup lang="ts">
definePageMeta({
  middleware: ['seller-only']
})
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useCategories } from '~/composables/useCategories'
import type { Category } from '~/types/Category'

const { getCategories, addCategory, deleteCategory, updateCategory } = useCategories()
const { currentUser } = useAuth()

const { data: categories, pending: loading, refresh } = await useAsyncData<Category[]>(
  'categories',
  () => getCategories(),
  { default: () => [] }
)

const newCategoryName = ref('')
const newCategoryDescription = ref('')
const editingCategoryId = ref<string | null>(null)
const editedCategoryName = ref('')
const editedCategoryDescription = ref('')

const currentUserId = computed(() => currentUser.value?.uid || null)

const addNewCategory = async (event: Event) => {
  event.preventDefault()
  if (!newCategoryName.value.trim() || !currentUserId.value) return

  try {
    const newCategoryId = await addCategory({
      name: newCategoryName.value,
      description: newCategoryDescription.value,
      createdBy: currentUserId.value,
    })

    categories.value?.push({
      id: newCategoryId,
      name: newCategoryName.value,
      description: newCategoryDescription.value,
      createdBy: currentUserId.value,
    })

    newCategoryName.value = ''
    newCategoryDescription.value = ''
  } catch (error) {
    console.error('Error adding category:', error)
  }
}

const deleteCategoryHandler = async (id: string) => {
  try {
    await deleteCategory(id)
    categories.value = categories.value?.filter(cat => cat.id !== id)
  } catch (error) {
    console.error('Error deleting category:', error)
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

    const target = categories.value?.find(cat => cat.id === category.id)
    if (target) {
      target.name = editedCategoryName.value
      target.description = editedCategoryDescription.value
    }

    cancelEditing()
  } catch (error) {
    console.error('Error updating category:', error)
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

    <h1 class="text-3xl font-bold mb-6">Categories</h1>

    <!-- Form Add Category -->
    <section class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">Add New Category</h2>
      <form @submit="addNewCategory">
        <label for="categoryName" class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
        <input
          id="categoryName"
          v-model="newCategoryName"
          type="text"
          class="mb-4 block w-full p-2 border border-gray-300 rounded-lg"
          placeholder="Enter category name"
          required
        />

        <label for="categoryDescription" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="categoryDescription"
          v-model="newCategoryDescription"
          class="mb-4 block w-full p-2 border border-gray-300 rounded-lg"
          placeholder="Enter description"
          rows="3"
        ></textarea>

        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Add Category
        </button>
      </form>
    </section>

    <!-- Categories List -->
    <section class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Category List</h2>

      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="categories?.length === 0" class="text-gray-400">No categories available.</div>

      <ul v-else class="divide-y">
        <li
          v-for="category in categories"
          :key="category.id"
          class="py-3 flex justify-between items-center"
        >
          <div class="flex-1">
            <template v-if="editingCategoryId === category.id">
              <input
                v-model="editedCategoryName"
                type="text"
                class="mb-2 p-2 border border-gray-300 rounded-lg w-full"
              />
              <textarea
                v-model="editedCategoryDescription"
                class="p-2 border border-gray-300 rounded-lg w-full"
                rows="3"
              ></textarea>
            </template>
            <template v-else>
              <div>
                <span class="text-lg font-medium">{{ category.name }}</span>
                <p class="text-gray-600 text-sm mt-1">{{ category.description }}</p>
              </div>
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
    </section>
  </div>
</template>
