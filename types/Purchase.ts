export type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

export interface Purchase {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  status: PurchaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchasePayload {
    supplierId: string
    productId: string
    quantity: number
    status?: 'pending' | 'completed' | 'cancelled' 
  }
  
  export interface UpdatePurchasePayload {
    status: 'pending' | 'completed' | 'cancelled'
  }