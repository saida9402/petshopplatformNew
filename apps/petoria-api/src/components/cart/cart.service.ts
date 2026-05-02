import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from '../../schemas/Cart.model';
import { CartStatus } from '../../libs/enums/cart.enum';
import { CartItemInput } from '../../libs/dto/cart/cart.input';
import { UpdateCartItemInput, RemoveCartItemInput } from '../../libs/dto/cart/cart.update';

@Injectable()
export class CartService {
	constructor(
		@InjectModel('Cart')
		private readonly cartModel: Model<Cart>,
	) {}

	/* ── private helper ── */
	private calcTotal(cartItems: { itemPrice: number; itemQuantity: number }[]): number {
		return cartItems.reduce((sum, item) => sum + item.itemPrice * item.itemQuantity, 0);
	}

	/* ══════════════════════════════════════════
	   ADD ITEM — add or increment a product
	══════════════════════════════════════════ */
	public async addToCart(memberId: string, input: CartItemInput): Promise<Cart> {
		// Find or create the active cart for this member
		let cart = await this.cartModel
			.findOne({
				memberId,
				cartStatus: CartStatus.ACTIVE,
			})
			.exec();

		if (!cart) {
			cart = await this.cartModel.create({
				memberId,
				cartItems: [],
				cartTotal: 0,
				cartStatus: CartStatus.ACTIVE,
			});
		}

		const productObjId = new Types.ObjectId(input.productId);
		const existingIdx = cart.cartItems.findIndex((i) => i.productId.toString() === productObjId.toString());

		if (existingIdx >= 0) {
			// Product already in cart — increment quantity
			cart.cartItems[existingIdx].itemQuantity += input.itemQuantity;
			cart.cartItems[existingIdx].itemPrice = input.itemPrice; // refresh price
		} else {
			// New product — push to array
			cart.cartItems.push({
				productId: productObjId,
				productName: input.productName,
				productImage: input.productImage ?? null,
				itemPrice: input.itemPrice,
				itemQuantity: input.itemQuantity,
			} as any);
		}

		cart.cartTotal = this.calcTotal(cart.cartItems);
		return cart.save();
	}

	/* ══════════════════════════════════════════
	   GET CART — active cart of a member
	══════════════════════════════════════════ */
	public async getMyCart(memberId: string): Promise<Cart> {
		let cart = await this.cartModel
			.findOne({
				memberId,
				cartStatus: CartStatus.ACTIVE,
			})
			.exec();

		if (!cart) {
			// Return an empty cart representation without persisting
			cart = await this.cartModel.create({
				memberId,
				cartItems: [],
				cartTotal: 0,
				cartStatus: CartStatus.ACTIVE,
			});
		}

		return cart;
	}

	/* ══════════════════════════════════════════
	   UPDATE ITEM QUANTITY
	   itemQuantity: 0 → removes the item
	══════════════════════════════════════════ */
	public async updateCartItem(input: UpdateCartItemInput): Promise<Cart> {
		const cart = await this.cartModel.findById(input.cartId).exec();
		if (!cart) throw new NotFoundException('Cart not found');
		if (cart.cartStatus !== CartStatus.ACTIVE) {
			throw new BadRequestException('Only active carts can be modified');
		}

		const productObjId = new Types.ObjectId(input.productId);
		const idx = cart.cartItems.findIndex((i) => i.productId.toString() === productObjId.toString());

		if (idx === -1) throw new NotFoundException('Product not found in cart');

		if (input.itemQuantity === 0) {
			cart.cartItems.splice(idx, 1);
		} else {
			cart.cartItems[idx].itemQuantity = input.itemQuantity;
		}

		cart.cartTotal = this.calcTotal(cart.cartItems);
		return cart.save();
	}

	/* ══════════════════════════════════════════
	   REMOVE ITEM — delete one product line
	══════════════════════════════════════════ */
	public async removeCartItem(input: RemoveCartItemInput): Promise<Cart> {
		const cart = await this.cartModel.findById(input.cartId).exec();
		if (!cart) throw new NotFoundException('Cart not found');
		if (cart.cartStatus !== CartStatus.ACTIVE) {
			throw new BadRequestException('Only active carts can be modified');
		}

		const productObjId = new Types.ObjectId(input.productId);
		const before = cart.cartItems.length;
		cart.cartItems = cart.cartItems.filter((i) => i.productId.toString() !== productObjId.toString()) as any;

		if (cart.cartItems.length === before) {
			throw new NotFoundException('Product not found in cart');
		}

		cart.cartTotal = this.calcTotal(cart.cartItems);
		return cart.save();
	}

	/* ══════════════════════════════════════════
	   CLEAR CART — remove all items
	══════════════════════════════════════════ */
	public async clearCart(cartId: string): Promise<Cart> {
		const cart = await this.cartModel.findById(cartId).exec();
		if (!cart) throw new NotFoundException('Cart not found');

		cart.cartItems = [] as any;
		cart.cartTotal = 0;
		return cart.save();
	}

	/* ══════════════════════════════════════════
	   CHECKOUT — mark cart as checked out
	   Called internally from OrderService
	══════════════════════════════════════════ */
	public async checkoutCart(cartId: string): Promise<Cart> {
		const result = await this.cartModel
			.findByIdAndUpdate(cartId, { $set: { cartStatus: CartStatus.CHECKED_OUT } }, { new: true })
			.exec();

		if (!result) throw new NotFoundException('Cart not found');
		return result;
	}
}
