import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { OrderInput } from '../../libs/dto/order/order.input';
import { OrderCancelInput, OrderUpdateInput } from '../../libs/dto/order/order.update';
import { Order } from '../../schemas/Order.model';

@Resolver(() => Order)
export class OrderResolver {
	constructor(private readonly orderService: OrderService) {}

	/* ── Mutations ── */

	/**
	 * Place a new order.
	 *
	 * @example
	 * mutation {
	 *   createOrder(
	 *     memberId: "665f1b2c3d4e5f6a7b8c9d0e"
	 *     input: {
	 *       orderItems: [
	 *         { productId: "...", itemQuantity: 2, itemPrice: 35 }
	 *       ]
	 *       paymentMethod: STRIPE
	 *       orderAddress: "123 Main St, Seoul, South Korea"
	 *       orderNote: "Please ring the doorbell"
	 *     }
	 *   ) {
	 *     _id orderStatus orderTotal createdAt
	 *   }
	 * }
	 */
	@Mutation(() => Order)
	public async createOrder(
		@Args('memberId', { type: () => ID }) memberId: string,
		@Args('input') input: OrderInput,
	): Promise<Order> {
		return this.orderService.createOrder(memberId, input);
	}

	/**
	 * Advance an order's status — admin only.
	 * Strict forward sequence: PENDING → PROCESS → CONFIRM → DELIVER
	 * Sending CANCEL is rejected — use cancelOrder instead.
	 *
	 * @example
	 * mutation {
	 *   updateOrder(input: { orderId: "...", orderStatus: PROCESS }) {
	 *     _id orderStatus
	 *     orderItems { itemStatus }
	 *   }
	 * }
	 */
	@Mutation(() => Order)
	public async updateOrder(@Args('input') input: OrderUpdateInput): Promise<Order> {
		return this.orderService.updateOrder(input);
	}

	/**
	 * Cancel an order (PENDING or PROCESS only).
	 *
	 * @example
	 * mutation {
	 *   cancelOrder(input: {
	 *     orderId: "..."
	 *     cancelReason: "Changed my mind"
	 *   }) {
	 *     _id orderStatus cancelReason cancelledAt
	 *   }
	 * }
	 */
	@Mutation(() => Order)
	public async cancelOrder(@Args('input') input: OrderCancelInput): Promise<Order> {
		return this.orderService.cancelOrder(input);
	}

	/* ── Queries ── */

	/**
	 * Fetch all orders placed by a specific member.
	 *
	 * @example
	 * query {
	 *   getMyOrders(memberId: "665f1b2c3d4e5f6a7b8c9d0e") {
	 *     _id orderStatus orderTotal paymentMethod createdAt
	 *     orderItems { productId itemQuantity itemPrice itemStatus }
	 *   }
	 * }
	 */
	@Query(() => [Order])
	public async getMyOrders(@Args('memberId', { type: () => ID }) memberId: string): Promise<Order[]> {
		return this.orderService.getMyOrders(memberId);
	}

	/**
	 * Fetch all orders — admin only.
	 *
	 * @example
	 * query {
	 *   getAllOrders {
	 *     _id memberId orderStatus orderTotal createdAt
	 *   }
	 * }
	 */
	@Query(() => [Order])
	public async getAllOrders(): Promise<Order[]> {
		return this.orderService.getAllOrders();
	}
}
