export interface Product {
    id: string;
    name: string; 
    price: number;
    stock: number
}
  
export interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Stock {
    id: string;
    productId: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

