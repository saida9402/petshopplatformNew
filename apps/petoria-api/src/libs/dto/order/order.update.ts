import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { OrderStatus } from '../../../libs/enums/order.enum';

/* ─────────────────────────────────────────
   OrderUpdateInput — advance order status (admin only)

   Allowed transitions:
   PENDING → PROCESS → CONFIRM → DELIVER

   Transitioning to CANCEL is blocked here —
   use cancelOrder mutation instead.
───────────────────────────────────────── */
@InputType()
export class OrderUpdateInput {
	@IsNotEmpty()
	@Field(() => ID)
	orderId: string;

	@IsNotEmpty()
	@Field(() => OrderStatus)
	orderStatus: OrderStatus;
}

/* ─────────────────────────────────────────
   OrderCancelInput — cancel an order
───────────────────────────────────────── */
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
