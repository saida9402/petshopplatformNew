import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { OrderPaymentMethod } from '../../../libs/enums/order.enum';

/* ─────────────────────────────────────────
   OrderItemInput — a single product in the order
───────────────────────────────────────── */
@InputType()
export class OrderItemInput {
	@IsNotEmpty()
	@Field(() => ID)
	productId: string;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	itemQuantity: number;

	/**
	 * Unit price provided by the client.
	 * The server recalculates orderTotal from this value —
	 * never trust the client-side total directly.
	 */
	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Field(() => Int)
	itemPrice: number;
}

/* ─────────────────────────────────────────
   OrderInput — create a new order
───────────────────────────────────────── */
@InputType()
export class OrderInput {
	@IsNotEmpty()
	@Field(() => [OrderItemInput])
	orderItems: OrderItemInput[];

	@IsNotEmpty()
	@Field(() => OrderPaymentMethod)
	paymentMethod: OrderPaymentMethod;

	@IsNotEmpty()
	@Length(5, 200)
	@Field(() => String)
	orderAddress: string;

	@IsOptional()
	@Length(0, 300)
	@Field({ nullable: true })
	orderNote?: string;
}
