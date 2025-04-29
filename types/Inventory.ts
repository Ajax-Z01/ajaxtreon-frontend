export interface Product {
    id: string;
    name: string; 
    price: number;
    stock: number
}

export type CreateProductPayload = Omit<Product, 'id'>
export type UpdateProductPayload = Partial<Omit<Product, 'id'>>
  
export interface Category {
    id: number
    name: string
  }  

export interface Stock {
    id: string;
    productId: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

