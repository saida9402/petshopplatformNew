import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

/* ─────────────────────────────────────────
   UpdateCartItemInput — change item quantity
   quantity: 0 → removes the item from cart
───────────────────────────────────────── */
@InputType()
export class UpdateCartItemInput {
	@IsNotEmpty()
	@Field(() => ID)
	cartId: string;

	@IsNotEmpty()
	@Field(() => ID)
	productId: string;

	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Field(() => Int)
	itemQuantity: number;
}

/* ─────────────────────────────────────────
   RemoveCartItemInput — remove one product
───────────────────────────────────────── */
@InputType()
export class RemoveCartItemInput {
	@IsNotEmpty()
	@Field(() => ID)
	cartId: string;

	@IsNotEmpty()
	@Field(() => ID)
	productId: string;
}
