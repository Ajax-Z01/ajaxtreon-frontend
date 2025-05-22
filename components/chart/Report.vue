<script setup lang="ts">
import { computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { formatDate } from '~/utils/formatDate'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  title: string,
  items: Record<string, any>[],
  labelKey: string,
  valueKey: string,
}>()

function groupByLabel(items: Record<string, any>[], labelKey: string, valueKey: string) {
  const map = new Map<string, number>()
  items.forEach(item => {
    const rawLabel = item[labelKey]
    let label = ''

    // Coba parse tanggal
    const date = new Date(rawLabel)
    if (!isNaN(date.getTime())) {
      label = formatDate(rawLabel)
    } else {
      label = String(rawLabel || '')
    }

    const value = Number(item[valueKey]) || 0
    console.log('groupByLabel item:', { rawLabel, label, value })
    if (label) {
      map.set(label, (map.get(label) || 0) + value)
    } else {
      console.warn('Invalid label from:', rawLabel)
    }
  })
  const labels = Array.from(map.keys())
  const data = Array.from(map.values())
  console.log('groupByLabel result:', { labels, data })
  return { labels, data }
}

const grouped = computed(() => {
  const result = groupByLabel(props.items, props.labelKey, props.valueKey)
  console.log('grouped computed:', result)
  return result
})

const chartData = computed(() => ({
  labels: grouped.value.labels,
  datasets: [
    {
      label: props.title,
      backgroundColor: '#3b82f6',
      data: grouped.value.data,
    }
  ],
}))

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: props.title,
    },
  },
}

watch(() => props.items, (newItems) => {
  console.log('props.items changed:', newItems)
}, { deep: true })
</script>

<template>
  <div class="my-6">
    <div v-if="props.items.length > 0">
      <Bar :data="chartData" :options="options" />
    </div>
    <div v-else class="text-gray-500 italic">
      Tidak ada data untuk ditampilkan.
    </div>
  </div>
</template>
