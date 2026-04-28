import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import mongoose, { Schema } from 'mongoose';
import { CartStatus } from '../libs/enums/cart.enum';

// ═══════════════════════════════════════════════════════════════
//  OBJECT TYPE
// ═══════════════════════════════════════════════════════════════

@ObjectType()
export class Cart {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	memberId: mongoose.Types.ObjectId;

	@Field(() => ID)
	productId: mongoose.Types.ObjectId;

	@Field(() => Int)
	cartQuantity: number;

	@Field(() => CartStatus)
	cartStatus: CartStatus;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
//  MONGOOSE SCHEMA
// ═══════════════════════════════════════════════════════════════

export const CartSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
		productId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Product',
		},
		cartQuantity: {
			type: Number,
			required: true,
			min: 1,
			default: 1,
		},
		cartStatus: {
			type: String,
			enum: Object.values(CartStatus),
			default: CartStatus.ACTIVE,
		},
	},
	{ timestamps: true, collection: 'carts' },
);

// Tezkor qidiruv uchun index (unique emas)
CartSchema.index({ memberId: 1, cartStatus: 1 }, { name: 'member-status' });
