export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export type Order = {
    id: string
    customerId: string
    productId: string
    quantity: number
    totalPrice: number
    status: OrderStatus
    createdAt: string
}

export type CreateOrderPayload = {
    customerId: string
    productId: string
    quantity: number
    status: OrderStatus
}

export type UpdateOrderPayload = Partial<CreateOrderPayload>
