import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { OrderItemStatus, OrderPaymentMethod, OrderStatus } from '../../enums/order.enum';

@ObjectType()
export class OrderItemDTO {
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
export class OrderDTO {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	memberId: mongoose.Types.ObjectId;

	@Field(() => [OrderItemDTO])
	orderItems: OrderItemDTO[];

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
	cancelReason?: string;

	@Field({ nullable: true })
	cancelledAt?: Date;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
