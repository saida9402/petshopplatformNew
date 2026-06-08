import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from '../../schemas/Cart.model';
import { CartItemInput } from '../../libs/dto/cart/cart.input';
import { UpdateCartItemInput, RemoveCartItemInput } from '../../libs/dto/cart/cart.update';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';

@Resolver(() => Cart)
export class CartResolver {
	constructor(private readonly cartService: CartService) {}

	/* ── Queries ── */

	@UseGuards(AuthGuard)
	@Query(() => Cart)
	public async getMyCart(@AuthMember('_id') memberId: ObjectId): Promise<Cart> {
		return this.cartService.getMyCart(memberId.toString());
	}

	/* ── Mutations ── */

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	public async addToCart(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: CartItemInput,
	): Promise<Cart> {
		return this.cartService.addToCart(memberId.toString(), input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	public async updateCartItem(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: UpdateCartItemInput,
	): Promise<Cart> {
		return this.cartService.updateCartItem(memberId.toString(), input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	public async removeCartItem(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: RemoveCartItemInput,
	): Promise<Cart> {
		return this.cartService.removeCartItem(memberId.toString(), input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	public async clearCart(
		@AuthMember('_id') memberId: ObjectId,
		@Args('cartId', { type: () => ID }) cartId: string,
	): Promise<Cart> {
		return this.cartService.clearCart(memberId.toString(), cartId);
	}
}
