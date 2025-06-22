<script setup lang="ts">
import { ref, computed } from 'vue'
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

const isEmpty = computed(() => {
  return (
    reportStore.sales.length === 0 &&
    reportStore.purchases.length === 0 &&
    reportStore.revenue.length === 0 &&
    reportStore.stocks.length === 0 &&
    reportStore.customers.length === 0 &&
    reportStore.suppliers.length === 0 &&
    reportStore.inventoryTurnover.length === 0
  )
})

const fetchReports = () => {
  reportStore.fetchAllReports(query.value)
  showReports.value = true
}
</script>

<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Laporan</h1>

    <!-- Filter Form -->
    <form @submit.prevent="fetchReports" class="flex flex-wrap gap-4 mb-6">
      <div class="w-full sm:w-auto flex-1">
        <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Mulai</label>
        <input
          v-model="query.startDate"
          type="date"
          class="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
      <div class="w-full sm:w-auto flex-1">
        <label class="block mb-1 text-sm font-medium text-gray-700">Tanggal Selesai</label>
        <input
          v-model="query.endDate"
          type="date"
          class="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
      <div class="w-full sm:w-auto flex items-end">
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm transition w-full sm:w-auto"
        >
          Tampilkan
        </button>
      </div>
    </form>

    <!-- Loading -->
    <div v-if="reportStore.isLoading" class="text-gray-500 space-y-6">
      <div class="animate-pulse space-y-4">
        <div class="h-6 bg-gray-300 rounded w-1/2"></div>
        <div class="h-48 bg-gray-200 rounded"></div>
        <div class="h-6 bg-gray-300 rounded w-1/3 mt-6"></div>
        <div class="h-48 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="reportStore.error" class="text-red-600 text-center mt-6">{{ reportStore.error }}</div>

    <!-- Empty State -->
    <div v-if="!showReports && !reportStore.isLoading" class="text-center text-gray-500 py-32">
      <div class="flex justify-center mb-4">
        <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-base sm:text-lg">Silakan pilih tanggal dan tekan tombol <strong>Tampilkan</strong> untuk melihat laporan.</p>
    </div>

    <!-- Report Result -->
    <div v-if="showReports && !reportStore.isLoading && !reportStore.error" class="space-y-12">
      <!-- Gunakan wrapper overflow-x untuk mobile scroll -->
      <div class="space-y-4">
        <ReportSection title="Laporan Penjualan" :items="reportStore.sales" />
        <div class="overflow-x-auto">
          <ReportChart
            title="Laporan Penjualan"
            :items="reportStore.sales"
            labelKey="orderDate"
            valueKey="totalQuantity"
          />
        </div>
      </div>

      <div class="space-y-4">
        <ReportSection title="Laporan Pembelian" :items="reportStore.purchases" />
        <div class="overflow-x-auto">
          <ReportChart
            title="Laporan Pembelian"
            :items="reportStore.purchases"
            labelKey="supplierId"
            valueKey="quantity"
          />
        </div>
      </div>

      <div class="space-y-4">
        <ReportSection title="Laporan Pendapatan" :items="reportStore.revenue" />
        <div class="overflow-x-auto">
          <ReportChart
            title="Laporan Pendapatan"
            :items="reportStore.revenue"
            labelKey="orderDate"
            valueKey="netRevenue"
          />
        </div>
      </div>

      <div class="space-y-4">
        <ReportSection title="Laporan Stok" :items="reportStore.stocks" />
        <div class="overflow-x-auto">
          <ReportChart
            title="Laporan Stok"
            :items="reportStore.stocks"
            labelKey="productName"
            valueKey="currentStock"
          />
        </div>
      </div>

      <div class="space-y-4">
        <ReportSection title="Laporan Customer" :items="reportStore.customers" />
        <div class="overflow-x-auto">
          <ReportChart
            title="Laporan Customer"
            :items="reportStore.customers"
            labelKey="name"
            valueKey="totalOrders"
          />
        </div>
      </div>

      <div class="space-y-4">
        <ReportSection title="Laporan Supplier" :items="reportStore.suppliers" />
        <div class="overflow-x-auto">
          <ReportChart
            title="Laporan Supplier"
            :items="reportStore.suppliers"
            labelKey="name"
            valueKey="totalQuantityPurchased"
          />
        </div>
      </div>

      <div class="space-y-4">
        <ReportSection title="Laporan Inventory Turnover" :items="reportStore.inventoryTurnover" />
        <div class="overflow-x-auto">
          <ReportChart
            title="Laporan Inventory Turnover"
            :items="reportStore.inventoryTurnover"
            labelKey="productName"
            valueKey="inventoryTurnoverRatio"
          />
        </div>
      </div>
    </div>
  </div>
</template>
