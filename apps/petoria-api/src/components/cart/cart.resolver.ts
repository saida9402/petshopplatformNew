import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { Cart } from '../../schemas/Cart.model';
import { CartItemInput } from '../../libs/dto/cart/cart.input';
import { UpdateCartItemInput, RemoveCartItemInput } from '../../libs/dto/cart/cart.update';

@Resolver(() => Cart)
export class CartResolver {
	constructor(private readonly cartService: CartService) {}

	/* ── Queries ── */

	/**
	 * Get the active cart of a member.
	 * Creates an empty cart if none exists.
	 *
	 * @example
	 * query {
	 *   getMyCart(memberId: "665f...") {
	 *     _id cartTotal cartStatus
	 *     cartItems { productId productName itemPrice itemQuantity }
	 *   }
	 * }
	 */
	@Query(() => Cart)
	public async getMyCart(@Args('memberId', { type: () => ID }) memberId: string): Promise<Cart> {
		return this.cartService.getMyCart(memberId);
	}

	/* ── Mutations ── */

	/**
	 * Add a product to the cart (or increment quantity if already present).
	 *
	 * @example
	 * mutation {
	 *   addToCart(
	 *     memberId: "665f..."
	 *     input: {
	 *       productId: "..."
	 *       productName: "Royal Canin Adult"
	 *       itemPrice: 35
	 *       itemQuantity: 2
	 *     }
	 *   ) { _id cartTotal cartItems { productName itemQuantity } }
	 * }
	 */
	@Mutation(() => Cart)
	public async addToCart(
		@Args('memberId', { type: () => ID }) memberId: string,
		@Args('input') input: CartItemInput,
	): Promise<Cart> {
		return this.cartService.addToCart(memberId, input);
	}

	/**
	 * Update the quantity of an item already in the cart.
	 * Send itemQuantity: 0 to remove the item.
	 *
	 * @example
	 * mutation {
	 *   updateCartItem(input: { cartId: "...", productId: "...", itemQuantity: 3 }) {
	 *     _id cartTotal cartItems { productId itemQuantity }
	 *   }
	 * }
	 */
	@Mutation(() => Cart)
	public async updateCartItem(@Args('input') input: UpdateCartItemInput): Promise<Cart> {
		return this.cartService.updateCartItem(input);
	}

	/**
	 * Remove a single product from the cart.
	 *
	 * @example
	 * mutation {
	 *   removeCartItem(input: { cartId: "...", productId: "..." }) {
	 *     _id cartTotal cartItems { productName }
	 *   }
	 * }
	 */
	@Mutation(() => Cart)
	public async removeCartItem(@Args('input') input: RemoveCartItemInput): Promise<Cart> {
		return this.cartService.removeCartItem(input);
	}

	/**
	 * Remove all items from the cart.
	 *
	 * @example
	 * mutation {
	 *   clearCart(cartId: "...") { _id cartTotal cartItems { _id } }
	 * }
	 */
	@Mutation(() => Cart)
	public async clearCart(@Args('cartId', { type: () => ID }) cartId: string): Promise<Cart> {
		return this.cartService.clearCart(cartId);
	}
}
