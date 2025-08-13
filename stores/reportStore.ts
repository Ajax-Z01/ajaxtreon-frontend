import { defineStore } from 'pinia'
import { useReports } from '~/composables/report/useReports'
import type {
  ReportQuery,
  SalesReportItem,
  PurchaseReportItem,
  RevenueReportItem,
  StockReportItem,
  CustomerReportItem,
  SupplierReportItem,
  InventoryTurnoverReportItem,
} from '~/types/Report'

export const useReportStore = defineStore('report', () => {
  const sales = ref<SalesReportItem[]>([])
  const purchases = ref<PurchaseReportItem[]>([])
  const revenue = ref<RevenueReportItem[]>([])
  const stocks = ref<StockReportItem[]>([])
  const customers = ref<CustomerReportItem[]>([])
  const suppliers = ref<SupplierReportItem[]>([])
  const inventoryTurnover = ref<InventoryTurnoverReportItem[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAllReports = async (query: ReportQuery) => {
    isLoading.value = true
    error.value = null
    try {
      const reportApi = useReports()
      const [
        salesData,
        purchaseData,
        revenueData,
        stockData,
        customerData,
        supplierData,
        inventoryTurnoverData
      ] = await Promise.all([
        reportApi.getSalesReport(query),
        reportApi.getPurchaseReport(query),
        reportApi.getRevenueReport(query),
        reportApi.getStockReport(query),
        reportApi.getCustomerReport(query),
        reportApi.getSupplierReport(query),
        reportApi.getInventoryTurnoverReport(query),
      ])

      sales.value = salesData
      purchases.value = purchaseData
      revenue.value = revenueData
      stocks.value = stockData
      customers.value = customerData
      suppliers.value = supplierData
      inventoryTurnover.value = inventoryTurnoverData
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch reports'
    } finally {
      isLoading.value = false
    }
  }

  return {
    sales,
    purchases,
    revenue,
    stocks,
    customers,
    suppliers,
    inventoryTurnover,
    isLoading,
    error,
    fetchAllReports,
  }
})
