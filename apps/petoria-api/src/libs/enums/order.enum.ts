import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	PENDING = 'PENDING', // Order placed, awaiting confirmation
	PROCESS = 'PROCESS', // Being prepared
	CONFIRM = 'CONFIRM', // Confirmed
	DELIVERED = 'DELIVERED', // Delivered
	CANCEL = 'CANCEL', // Cancelled
}

export enum OrderItemStatus {
	PENDING = 'PENDING',
	PROCESS = 'PROCESS',
	CONFIRM = 'CONFIRM',
	DELIVERED = 'DELIVERED',
	CANCEL = 'CANCEL',
}

export enum OrderPaymentMethod {
	CREDIT_CARD = 'CREDIT_CARD', // Visa / MasterCard / Amex
	DEBIT_CARD = 'DEBIT_CARD', // Debit karta
	CASH = 'CASH', // Naqd pul (delivery vaqtida)
	PAYPAL = 'PAYPAL', // PayPal
	STRIPE = 'STRIPE', // Stripe
	APPLE_PAY = 'APPLE_PAY', // Apple Pay
	GOOGLE_PAY = 'GOOGLE_PAY', // Google Pay
	BANK_TRANSFER = 'BANK_TRANSFER', // Bank o'tkazmasi
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
