import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { OrderItemStatus, OrderPaymentMethod, OrderStatus } from '../libs/enums/order.enum';

// ─── registerEnumType FAQAT BIR MARTA — bu yerda ─────────────────────────────
registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(OrderItemStatus, { name: 'OrderItemStatus' });
registerEnumType(OrderPaymentMethod, { name: 'OrderPaymentMethod' });

// ═══════════════════════════════════════════════════════════════
//  OBJECT TYPES
// ═══════════════════════════════════════════════════════════════

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

	@Field({ nullable: true })
	cancelledAt?: Date;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
//  MONGOOSE SCHEMAS
// ═══════════════════════════════════════════════════════════════

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
			enum: Object.values(OrderItemStatus), // ✅ Object.values — massiv kerak
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
			enum: Object.values(OrderStatus), // ✅ Object.values
			default: OrderStatus.PENDING,
		},
		paymentMethod: {
			type: String,
			enum: Object.values(OrderPaymentMethod), // ✅ Object.values
			required: true,
		},
		orderAddress: {
			type: String,
		},
		orderNote: {
			type: String,
		},
		cancelledAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'orders' },
);
