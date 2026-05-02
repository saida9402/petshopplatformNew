import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { CartStatus } from '../../enums/cart.enum';

@ObjectType()
export class CartItemDTO {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	productId: mongoose.Types.ObjectId;

	@Field()
	productName: string;

	@Field({ nullable: true })
	productImage?: string;

	@Field(() => Int)
	itemPrice: number;

	@Field(() => Int)
	itemQuantity: number;
}

@ObjectType()
export class CartDTO {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	memberId: mongoose.Types.ObjectId;

	@Field(() => [CartItemDTO])
	cartItems: CartItemDTO[];

	@Field(() => Int)
	cartTotal: number;

	@Field(() => CartStatus)
	cartStatus: CartStatus;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
