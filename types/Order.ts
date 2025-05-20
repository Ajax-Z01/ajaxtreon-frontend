export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  items: OrderItem[];

  totalAmount: number;
  discount?: number;
  tax?: number;
  paymentMethod?: string;
  refundAmount?: number;
  paymentId?: string;
  createdBy?: string;
}

export interface CreateOrderPayload {
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status?: OrderStatus;
  discount?: number;
  tax?: number;
  paymentMethod?: string;
  refundAmount?: number;
  createdBy?: string;
}

export interface UpdateOrderPayload {
  status?: OrderStatus;
  items?: OrderItem[];
  totalAmount?: number;
  discount?: number;
  tax?: number;
  paymentMethod?: string;
  refundAmount?: number;
}
