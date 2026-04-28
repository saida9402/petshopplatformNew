import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { OrderService } from './order.service';
import { OrderInput } from '../../libs/dto/order/order.input';
import { Order } from '../../schemas/Order.model';
import { OrderCancelInput, OrderUpdateInput } from '../../libs/dto/order/order.update';

@Resolver(() => Order)
export class OrderResolver {
	constructor(private readonly orderService: OrderService) {}

	@Mutation(() => Order)
	public async createOrder(
		@Args('memberId', { type: () => ID }) memberId: string,
		@Args('input') input: OrderInput,
	): Promise<Order> {
		return await this.orderService.createOrder(memberId, input);
	}

	@Query(() => [Order])
	public async getMyOrders(@Args('memberId', { type: () => ID }) memberId: string): Promise<Order[]> {
		return await this.orderService.getMyOrders(memberId);
	}

	@Query(() => [Order])
	public async getAllOrders(): Promise<Order[]> {
		return await this.orderService.getAllOrders();
	}

	@Mutation(() => Order)
	public async updateOrder(@Args('input') input: OrderUpdateInput): Promise<Order> {
		return await this.orderService.updateOrder(input);
	}

	@Mutation(() => Order)
	public async cancelOrder(@Args('input') input: OrderCancelInput): Promise<Order> {
		return await this.orderService.cancelOrder(input);
	}
}
