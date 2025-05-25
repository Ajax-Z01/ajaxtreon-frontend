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
