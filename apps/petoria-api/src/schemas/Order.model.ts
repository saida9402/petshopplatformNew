// src/components/order/order.model.ts

import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';

import { OrderItemStatus, OrderPaymentMethod, OrderStatus } from '../libs/enums/order.enum';

registerEnumType(OrderStatus, {
	name: 'OrderStatus',
});

registerEnumType(OrderItemStatus, {
	name: 'OrderItemStatus',
});

registerEnumType(OrderPaymentMethod, {
	name: 'OrderPaymentMethod',
});

@ObjectType()
export class OrderItem {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	productId: mongoose.Types.ObjectId;

	@Field(() => Int)
	itemQuantity: number;

	@Field(() => Int)
	itemPrice: number;

	@Field(() => OrderItemStatus)
	itemStatus: OrderItemStatus;
}

@ObjectType()
export class Order {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	memberId: mongoose.Types.ObjectId;

	@Field(() => [OrderItem])
	orderItems: OrderItem[];

	@Field(() => Int)
	orderTotal: number;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;

	@Field(() => OrderPaymentMethod)
	paymentMethod: OrderPaymentMethod;

	@Field({ nullable: true })
	orderAddress?: string;

	@Field({ nullable: true })
	orderNote?: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

export const OrderItemSchema = new Schema(
	{
		productId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Product',
		},

		itemQuantity: {
			type: Number,
			required: true,
			min: 1,
		},

		itemPrice: {
			type: Number,
			required: true,
		},

		itemStatus: {
			type: String,
			enum: OrderItemStatus,
			default: OrderItemStatus.ACTIVE,
		},
	},
	{ _id: true },
);

export const OrderSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		orderItems: {
			type: [OrderItemSchema],
			required: true,
		},

		orderTotal: {
			type: Number,
			required: true,
		},

		orderStatus: {
			type: String,
			enum: OrderStatus,
			default: OrderStatus.PENDING,
		},

		paymentMethod: {
			type: String,
			enum: OrderPaymentMethod,
			required: true,
		},

		orderAddress: {
			type: String,
		},

		orderNote: {
			type: String,
		},
	},
	{ timestamps: true, collection: 'orders' },
);
