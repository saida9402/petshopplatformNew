import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CartStatus } from '../libs/enums/cart.enum';

/* ─────────────────────────────────────────
   CartItem — individual product line in a cart
───────────────────────────────────────── */
@ObjectType()
@Schema({ _id: true, timestamps: false })
export class CartItem {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	@Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
	productId: mongoose.Types.ObjectId;

	@Field()
	@Prop({ type: String, required: true, trim: true })
	productName: string;

	@Field({ nullable: true })
	@Prop({ type: String, default: null })
	productImage?: string;

	@Field(() => Int)
	@Prop({ type: Number, required: true, min: 0 })
	itemPrice: number;

	@Field(() => Int)
	@Prop({ type: Number, required: true, min: 1, default: 1 })
	itemQuantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

/* ─────────────────────────────────────────
   Cart — main cart document
───────────────────────────────────────── */
@ObjectType()
@Schema({ timestamps: true, collection: 'carts' })
export class Cart extends Document {
	@Field(() => ID)
	_id: mongoose.Types.ObjectId;

	@Field(() => ID)
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true })
	memberId: mongoose.Types.ObjectId;

	@Field(() => [CartItem])
	@Prop({ type: [CartItemSchema], default: [] })
	cartItems: CartItem[];

	@Field(() => Int)
	@Prop({ type: Number, required: true, min: 0, default: 0 })
	cartTotal: number;

	@Field(() => CartStatus)
	@Prop({ type: String, enum: CartStatus, default: CartStatus.ACTIVE })
	cartStatus: CartStatus;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

/* ── Indexes ── */
CartSchema.index({ memberId: 1, cartStatus: 1 });
