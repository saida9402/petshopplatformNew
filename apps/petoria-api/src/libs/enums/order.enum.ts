import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	PENDING = 'PENDING',
	PROCESS = 'PROCESS',
	CONFIRM = 'CONFIRM',
	DELIVERED = 'DELIVERED',
	CANCEL = 'CANCEL',
}

export enum OrderItemStatus {
	PENDING = 'PENDING',
	PROCESS = 'PROCESS',
	CONFIRM = 'CONFIRM',
	DELIVERED = 'DELIVERED',
	CANCEL = 'CANCEL',
}

export enum OrderPaymentMethod {
	CREDIT_CARD = 'CREDIT_CARD',
	DEBIT_CARD = 'DEBIT_CARD',
	CASH = 'CASH',
	PAYPAL = 'PAYPAL',
	STRIPE = 'STRIPE',
	APPLE_PAY = 'APPLE_PAY',
	GOOGLE_PAY = 'GOOGLE_PAY',
	BANK_TRANSFER = 'BANK_TRANSFER',
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus',
	description: 'Order status',
	valuesMap: {
		PENDING: { description: 'Awaiting confirmation' },
		PROCESS: { description: 'Being prepared' },
		CONFIRM: { description: 'Confirmed' },
		DELIVERED: { description: 'Delivered' },
		CANCEL: { description: 'Cancelled' },
	},
});

registerEnumType(OrderItemStatus, {
	name: 'OrderItemStatus',
	description: 'Order item status',
});

registerEnumType(OrderPaymentMethod, {
	name: 'OrderPaymentMethod',
	description: 'Payment method',
	valuesMap: {
		CREDIT_CARD: { description: 'Credit card (Visa / MasterCard / Amex)' },
		DEBIT_CARD: { description: 'Debit card' },
		CASH: { description: 'Cash on delivery' },
		PAYPAL: { description: 'PayPal' },
		STRIPE: { description: 'Stripe' },
		APPLE_PAY: { description: 'Apple Pay' },
		GOOGLE_PAY: { description: 'Google Pay' },
		BANK_TRANSFER: { description: 'Bank transfer' },
	},
});
