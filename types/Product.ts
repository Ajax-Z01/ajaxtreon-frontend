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