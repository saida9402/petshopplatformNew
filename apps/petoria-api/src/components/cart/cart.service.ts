import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from '../../schemas/Cart.model';
import { CartStatus } from '../../libs/enums/cart.enum';
import { CartItemInput } from '../../libs/dto/cart/cart.input';
import { UpdateCartItemInput, RemoveCartItemInput } from '../../libs/dto/cart/cart.update';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class CartService {
	private readonly logger = new Logger(CartService.name);

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
		try {
			let cart = await this.cartModel
				.findOne({ memberId, cartStatus: CartStatus.ACTIVE })
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
				cart.cartItems[existingIdx].itemQuantity += input.itemQuantity;
				cart.cartItems[existingIdx].itemPrice = input.itemPrice;
			} else {
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
		} catch (err) {
			this.logger.error('addToCart failed', err.message);
			throw new BadRequestException(Message.BAD_REQUEST);
		}
	}

	/* ══════════════════════════════════════════
	   GET CART — active cart of a member
	══════════════════════════════════════════ */
	public async getMyCart(memberId: string): Promise<Cart> {
		try {
			let cart = await this.cartModel
				.findOne({ memberId, cartStatus: CartStatus.ACTIVE })
				.exec();

			if (!cart) {
				cart = await this.cartModel.create({
					memberId,
					cartItems: [],
					cartTotal: 0,
					cartStatus: CartStatus.ACTIVE,
				});
			}

			return cart;
		} catch (err) {
			this.logger.error('getMyCart failed', err.message);
			throw new BadRequestException(Message.BAD_REQUEST);
		}
	}

	/* ══════════════════════════════════════════
	   UPDATE ITEM QUANTITY
	   itemQuantity: 0 → removes the item
	══════════════════════════════════════════ */
	public async updateCartItem(memberId: string, input: UpdateCartItemInput): Promise<Cart> {
		try {
			const cart = await this.cartModel.findById(input.cartId).exec();
			if (!cart) throw new NotFoundException('Cart not found');
			if (cart.memberId.toString() !== memberId) throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
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
		} catch (err) {
			if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
			this.logger.error('updateCartItem failed', err.message);
			throw new BadRequestException(Message.BAD_REQUEST);
		}
	}

	/* ══════════════════════════════════════════
	   REMOVE ITEM — delete one product line
	══════════════════════════════════════════ */
	public async removeCartItem(memberId: string, input: RemoveCartItemInput): Promise<Cart> {
		try {
			const cart = await this.cartModel.findById(input.cartId).exec();
			if (!cart) throw new NotFoundException('Cart not found');
			if (cart.memberId.toString() !== memberId) throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
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
		} catch (err) {
			if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
			this.logger.error('removeCartItem failed', err.message);
			throw new BadRequestException(Message.BAD_REQUEST);
		}
	}

	/* ══════════════════════════════════════════
	   CLEAR CART — remove all items
	══════════════════════════════════════════ */
	public async clearCart(memberId: string, cartId: string): Promise<Cart> {
		try {
			const cart = await this.cartModel.findById(cartId).exec();
			if (!cart) throw new NotFoundException('Cart not found');
			if (cart.memberId.toString() !== memberId) throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);

			cart.cartItems = [] as any;
			cart.cartTotal = 0;
			return cart.save();
		} catch (err) {
			if (err instanceof NotFoundException || err instanceof ForbiddenException) throw err;
			this.logger.error('clearCart failed', err.message);
			throw new BadRequestException(Message.BAD_REQUEST);
		}
	}

	/* ══════════════════════════════════════════
	   CHECKOUT — mark cart as checked out
	   Called internally from OrderService
	══════════════════════════════════════════ */
	public async checkoutCart(cartId: string): Promise<Cart> {
		try {
			const result = await this.cartModel
				.findByIdAndUpdate(cartId, { $set: { cartStatus: CartStatus.CHECKED_OUT } }, { new: true })
				.exec();

			if (!result) throw new NotFoundException('Cart not found');
			return result;
		} catch (err) {
			if (err instanceof NotFoundException) throw err;
			this.logger.error('checkoutCart failed', err.message);
			throw new BadRequestException(Message.BAD_REQUEST);
		}
	}
}
