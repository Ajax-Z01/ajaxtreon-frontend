export interface Product {
  id: string
  name: string
  price: number
  stock: number
  categoryId: string
  description?: string
  imageUrl?: string
  sku?: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  createdBy: string
}

export type CreateProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProductPayload = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>

export interface Category {
  id: string
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
}

export interface Stock {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  category?: string;
  updatedAt: Date;
}

export type ChangeType = 'add' | 'subtract'

export interface StockChangePayload {
  productId: string
  changeType: ChangeType
  quantity: number
  note: string
  updatedAt: Date;  
}
