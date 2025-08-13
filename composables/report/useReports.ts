import type {
  ReportQuery,
  SalesReportItem,
  PurchaseReportItem,
  StockReportItem,
  RevenueReportItem,
  StockHistoryItem,
  CustomerReportItem,
  SupplierReportItem,
  InventoryTurnoverReportItem
} from '~/types/Report'


export const useReports = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const authToken = useCookie<string | null>('authToken')

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authToken.value) {
      headers['Authorization'] = `Bearer ${authToken.value}`
    }

    return headers
  }

  const fetchReport = async <T>(endpoint: string, query: ReportQuery): Promise<T[]> => {
    const url = new URL(`${baseUrl}/report/${endpoint}`)
    url.searchParams.append('startDate', query.startDate)
    url.searchParams.append('endDate', query.endDate)

    const { data, error } = await useFetch<T[]>(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: `Failed to fetch ${endpoint} report` })
    }

    return data.value || []
  }
  
  const getStockHistory = async (productId: string): Promise<StockHistoryItem[]> => {
    const url = `${baseUrl}/report/stock-history/${productId}`

    const { data, error } = await useFetch<StockHistoryItem[]>(url, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (error.value) {
      throw createError({ statusCode: 500, message: 'Failed to fetch stock history' })
    }

    return data.value || []
  }

  return {
    getSalesReport: (q: ReportQuery) => fetchReport<SalesReportItem>('sales', q),
    getPurchaseReport: (q: ReportQuery) => fetchReport<PurchaseReportItem>('purchases', q),
    getStockReport: (q: ReportQuery) => fetchReport<StockReportItem>('stocks', q),
    getRevenueReport: (q: ReportQuery) => fetchReport<RevenueReportItem>('revenue', q),
    getCustomerReport: (q: ReportQuery) => fetchReport<CustomerReportItem>('customers', q),
    getSupplierReport: (q: ReportQuery) => fetchReport<SupplierReportItem>('suppliers', q),
    getInventoryTurnoverReport: (q: ReportQuery) => fetchReport<InventoryTurnoverReportItem>('inventory-turnover', q),
    getStockHistory,
  }
}
