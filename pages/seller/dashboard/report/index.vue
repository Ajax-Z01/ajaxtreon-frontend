<script setup lang="ts">
import { ref } from 'vue'
import { useReportStore } from '~/stores/reportStore'
import type { ReportQuery } from '~/types/Report'
import ReportSection from '~/components/section/Report.vue'
import ReportChart from '~/components/chart/Report.vue'

const reportStore = useReportStore()

const today = new Date().toISOString().split('T')[0]
const query = ref<ReportQuery>({
  startDate: today,
  endDate: today,
})

const showReports = ref(false)

const fetchReports = () => {
  reportStore.fetchAllReports(query.value)
  showReports.value = true
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Laporan</h1>

    <form @submit.prevent="fetchReports" class="flex gap-4 mb-6">
      <div>
        <label class="block mb-1 text-sm font-medium">Tanggal Mulai</label>
        <input v-model="query.startDate" type="date" class="border px-3 py-2 rounded w-full" required />
      </div>
      <div>
        <label class="block mb-1 text-sm font-medium">Tanggal Selesai</label>
        <input v-model="query.endDate" type="date" class="border px-3 py-2 rounded w-full" required />
      </div>
      <div class="flex items-end">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Tampilkan</button>
      </div>
    </form>

    <div v-if="reportStore.isLoading" class="text-gray-500">Memuat data...</div>
    <div v-if="reportStore.error" class="text-red-600">{{ reportStore.error }}</div>

    <div v-if="showReports && !reportStore.isLoading && !reportStore.error">
      <ReportSection title="Laporan Penjualan" :items="reportStore.sales" />
      <ReportChart
        title="Laporan Penjualan"
        :items="reportStore.sales"
        labelKey="orderDate"
        valueKey="totalQuantity"
      />
      <ReportSection title="Laporan Pembelian" :items="reportStore.purchases" />
      <ReportChart
        title="Laporan Pembelian"
        :items="reportStore.purchases"
        labelKey="supplierId"
        valueKey="quantity"
      />
      <ReportSection title="Laporan Pendapatan" :items="reportStore.revenue" />
      <ReportChart
        title="Laporan Pendapatan"
        :items="reportStore.revenue"
        labelKey="orderDate"
        valueKey="netRevenue"
      />
      <ReportSection title="Laporan Stok" :items="reportStore.stocks" />
      <ReportChart
        title="Laporan Stok"
        :items="reportStore.stocks"
        labelKey="productName"
        valueKey="currentStock"
      />
      <ReportSection title="Laporan Customer" :items="reportStore.customers" />
      <ReportChart
        title="Laporan Customer"
        :items="reportStore.customers"
        labelKey="name"
        valueKey="totalOrders"
      />
      <ReportSection title="Laporan Supplier" :items="reportStore.suppliers" />
      <ReportChart
        title="Laporan Supplier"
        :items="reportStore.suppliers"
        labelKey="name"
        valueKey="totalQuantityPurchased"
      />
      <ReportSection title="Laporan Inventory Turnover" :items="reportStore.inventoryTurnover" />
      <ReportChart
        title="Laporan Inventory Turnover"
        :items="reportStore.inventoryTurnover"
        labelKey="productName"
        valueKey="inventoryTurnoverRatio"
      />
    </div>
  </div>
</template>
