<script setup lang="ts">
import type { Product } from '~/types/Product'
import type { Category } from '~/types/Category'

const props = defineProps<{
  product: Product
  categories: Category[]
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold truncate">{{ props.product.name }}</h3>
      <span
        class="px-2 py-0.5 text-xs rounded-full"
        :class="props.product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'"
      >
        {{ props.product.isActive ? 'Active' : 'Inactive' }}
      </span>
    </div>

    <div class="mt-2 h-40 flex items-center justify-center overflow-hidden bg-gray-50 rounded">
      <img
        v-if="props.product.imageUrl"
        :src="props.product.imageUrl"
        alt="Product image"
        class="object-cover h-full w-full"
      />
      <div v-else class="text-gray-400 text-sm">No Image</div>
    </div>

    <div class="mt-3 space-y-1 text-sm">
      <div><strong>Price:</strong> ${{ props.product.price }}</div>
      <div><strong>Stock:</strong> {{ props.product.stock }}</div>
      <div><strong>SKU:</strong> {{ props.product.sku || '-' }}</div>
      <div><strong>Category:</strong> 
        {{ props.categories.find(c => c.id === props.product.categoryId)?.name || '-' }}
      </div>
    </div>

    <div class="mt-4 flex gap-2 justify-end">
      <button
        @click="$emit('edit', props.product)"
        class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
      >
        Edit
      </button>
      <button
        @click="$emit('delete', props.product.id)"
        class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        Delete
      </button>
    </div>
  </div>
</template>
