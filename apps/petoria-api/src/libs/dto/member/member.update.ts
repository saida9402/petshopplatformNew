import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { OrderStatus } from '../../../libs/enums/order.enum';

@InputType()
export class OrderUpdateInput {
	@IsNotEmpty()
	@Field(() => ID)
	orderId: string;

	@IsNotEmpty()
	@Field(() => OrderStatus)
	orderStatus: OrderStatus;
}

@InputType()
export class OrderCancelInput {
	@IsNotEmpty()
	@Field(() => ID)
	orderId: string;

	@IsOptional()
	@Length(0, 300)
	@Field({ nullable: true })
	cancelReason?: string;
}
