export enum OrderStatus {
	PENDING = 'PENDING',
	PROCESS = 'PROCESS',
	PAID = 'PAID',
	DELIVERED = 'DELIVERED',
	CANCEL = 'CANCEL',
}

export enum OrderItemStatus {
	ACTIVE = 'ACTIVE',
	CANCEL = 'CANCEL',
}

export enum OrderPaymentMethod {
	CASH = 'CASH',
	CARD = 'CARD',
}
