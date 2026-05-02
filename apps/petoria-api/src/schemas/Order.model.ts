import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { OrderItemStatus, OrderPaymentMethod, OrderStatus } from '../libs/enums/order.enum';

/* ─────────────────────────────────────────
   OrderItem — individual product line in an order
───────────────────────────────────────── */
@ObjectType()
@Schema({ _id: true, timestamps: false })
export class OrderItem {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	@Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
	productId: mongoose.Types.ObjectId;

	@Field(() => Int)
	@Prop({ type: Number, required: true, min: 1 })
	itemQuantity: number;

	@Field(() => Int)
	@Prop({ type: Number, required: true, min: 0 })
	itemPrice: number;

	@Field(() => OrderItemStatus)
	@Prop({
		type: String,
		enum: OrderItemStatus,
		default: OrderItemStatus.PENDING,
	})
	itemStatus: OrderItemStatus;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/* ─────────────────────────────────────────
   Order — main order document
───────────────────────────────────────── */
@ObjectType()
@Schema({ timestamps: true, collection: 'orders' })
export class Order extends Document {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true })
	memberId: mongoose.Types.ObjectId;

	@Field(() => [OrderItem])
	@Prop({ type: [OrderItemSchema], required: true })
	orderItems: OrderItem[];

	@Field(() => Int)
	@Prop({ type: Number, required: true, min: 0 })
	orderTotal: number;

	@Field(() => OrderStatus)
	@Prop({
		type: String,
		enum: OrderStatus,
		default: OrderStatus.PENDING,
	})
	orderStatus: OrderStatus;

	@Field(() => OrderPaymentMethod)
	@Prop({ type: String, enum: OrderPaymentMethod, required: true })
	paymentMethod: OrderPaymentMethod;

	@Field(() => String)
	@Prop({ type: String, required: true, minlength: 5, maxlength: 200 })
	orderAddress: string;

	@Field({ nullable: true })
	@Prop({ type: String, default: null, maxlength: 300 })
	orderNote?: string;

	/** Populated only when the order is cancelled via cancelOrder mutation */
	@Field({ nullable: true })
	@Prop({ type: String, default: null, maxlength: 300 })
	cancelReason?: string;

	@Field({ nullable: true })
	@Prop({ type: Date, default: null })
	cancelledAt?: Date;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

/* ── Indexes ── */
OrderSchema.index({ memberId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
