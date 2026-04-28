import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { OrderPaymentMethod } from '../../../libs/enums/order.enum';

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

	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Field(() => Int)
	itemPrice: number;
}

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
