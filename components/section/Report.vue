<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'

defineProps<{
  title: string,
  items: Record<string, any>[]
}>()

function formatValue(value: any) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return formatDate(value)
  }
  return value
}
</script>

<template>
  <div class="mb-8">
    <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>
    <p v-if="items.length === 0" class="text-sm text-gray-500">Tidak ada data.</p>
    <table v-else class="min-w-full border text-sm">
      <thead>
        <tr>
          <th v-for="key in Object.keys(items[0])" :key="key" class="border px-3 py-1 text-left bg-gray-100">
            {{ key }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
          <td v-for="(value, i) in Object.values(item)" :key="i" class="border px-3 py-1">
            {{ formatValue(value) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-family: system-ui, sans-serif;
}
thead th {
  background-color: #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid #d1d5db;
  padding: 0.5rem 1rem;
  text-align: left;
}
tbody td {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
}
tbody tr:hover {
  background-color: #f9fafb;
}
td, th {
  white-space: nowrap;
}
</style>
