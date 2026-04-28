import { Field, ID, InputType } from '@nestjs/graphql';

import { OrderStatus } from '../../../libs/enums/order.enum';

@InputType()
export class OrderUpdateInput {
	@Field(() => ID)
	orderId: string;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;
}

@InputType()
export class OrderCancelInput {
	@Field(() => ID)
	orderId: string;

	@Field({ nullable: true })
	cancelReason?: string;
}
