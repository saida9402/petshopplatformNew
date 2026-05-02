import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/* ─────────────────────────────────────────
   CartItemInput — add a product to the cart
───────────────────────────────────────── */
@InputType()
export class CartItemInput {
	@IsNotEmpty()
	@Field(() => ID)
	productId: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(200)
	@Field(() => String)
	productName: string;

	@IsOptional()
	@IsString()
	@Field({ nullable: true })
	productImage?: string;

	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Field(() => Int)
	itemPrice: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	itemQuantity: number;
}
