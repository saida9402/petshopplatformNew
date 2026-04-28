// src/components/order/dto/order.input.ts

import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { OrderPaymentMethod } from '../../../libs/enums/order.enum';

@InputType()
export class OrderItemInput {
	@Field(() => ID)
	productId: string;

	@Field(() => Int)
	itemQuantity: number;

	@Field(() => Int)
	itemPrice: number;
}

@InputType()
export class OrderInput {
	@Field(() => [OrderItemInput])
	orderItems: OrderItemInput[];

	@Field(() => OrderPaymentMethod)
	paymentMethod: OrderPaymentMethod;

	@Field()
	orderAddress: string;

	@Field({ nullable: true })
	orderNote?: string;
}
