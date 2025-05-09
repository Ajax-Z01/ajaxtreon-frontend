export interface Product {
    id: string
    name: string
    price: number
    stock: number
    categoryId: string
}

export type CreateProductPayload = Omit<Product, 'id'>
export type UpdateProductPayload = Partial<Omit<Product, 'id'>>
  
export interface Category {
    id: number
    name: string
}

export interface Stock {
    id: string
    productId: string
    quantity: number
    createdAt: Date
    updatedAt: Date
}

export interface StockChangePayload {
    productId: string
    changeType: 'add' | 'subtract'
    quantity: number
    timestamp: Date
    note: string
}