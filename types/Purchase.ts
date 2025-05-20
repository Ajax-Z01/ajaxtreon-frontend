export type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

export interface Purchase {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  status: PurchaseStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  isDeleted?: boolean;
  createdBy?: string;
  approvedBy?: string;
  invoiceNo?: string;
  notes?: string;
}

export interface CreatePurchasePayload {
  supplierId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  status?: PurchaseStatus;
  createdBy?: string;
  invoiceNo?: string;
  notes?: string;
}

export interface UpdatePurchasePayload {
  status?: PurchaseStatus;
  approvedBy?: string;
  notes?: string;
}
