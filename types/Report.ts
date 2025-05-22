import type { ChangeType } from './Inventory'

export interface ReportQuery {
  startDate: string
  endDate: string
}

export interface SalesReportItem {
  orderId: string
  customerId: string
  orderDate: string
  totalQuantity: number
  totalItems: number
  totalAmount: number
  paymentMethod?: string
}

export interface PurchaseReportItem {
  supplierId: string
  productId: string
  quantity: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  isDeleted?: boolean
}

export interface RevenueReportItem {
  orderId: string
  customerId: string
  orderDate: string
  totalAmount: number
  refundAmount: number
  netRevenue: number
  paymentMethod?: string
}

export interface StockReportItem {
  productId: string
  productName: string
  currentStock: number
  lastUpdated: string
  category?: string
}

export interface StockHistoryItem {
  productId: string
  changeType: ChangeType
  quantity: number
  timestamp: string
  note: string
}

export interface CustomerReportItem {
  customerId: string
  name: string
  email?: string
  phone?: string
  address?: string
  billingAddress?: string
  contactPersons?: {
    name: string
    email?: string
    phone?: string
    position?: string
  }[]
  loyaltyMemberId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  totalOrders: number
  totalCompletedOrders: number
  totalPendingOrders: number
  totalCancelledOrders: number
  totalAmountSpent: number
  averageOrderValue: number
  lastOrderDate?: string
}

export interface SupplierReportItem {
  supplierId: string
  name: string
  email?: string
  phone?: string
  address?: string
  companyName?: string
  taxId?: string
  paymentTerm?: string
  productsSupplied?: string[]
  createdAt: string
  updatedAt?: string
  totalPurchases: number
  totalQuantityPurchased: number
  lastPurchaseDate?: string
}

export interface InventoryTurnoverReportItem {
  productId: string
  productName: string
  category?: string
  beginningInventory: number
  endingInventory: number
  totalSoldQuantity: number
  averageInventory: number
  inventoryTurnoverRatio: number
  turnoverDays?: number
}
