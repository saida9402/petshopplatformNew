import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { OrderService } from './order.service';
import { OrderInput } from '../../libs/dto/order/order.input';
import { OrderCancelInput, OrderUpdateInput } from '../../libs/dto/order/order.update';
import { Order } from '../../schemas/Order.model';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver(() => Order)
export class OrderResolver {
	constructor(private readonly orderService: OrderService) {}

	/* ── Mutations ── */

	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	public async createOrder(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: OrderInput,
	): Promise<Order> {
		return this.orderService.createOrder(memberId.toString(), input);
	}

	@Roles(MemberType.ADMIN, MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Mutation(() => Order)
	public async updateOrder(
		@AuthMember('_id') memberId: ObjectId,
		@AuthMember('memberType') memberType: MemberType,
		@Args('input') input: OrderUpdateInput,
	): Promise<Order> {
		return this.orderService.updateOrder(memberId.toString(), memberType, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	public async updateMyOrderStatus(
		@Args('input') input: OrderUpdateInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Order> {
		return this.orderService.updateMyOrderStatus(memberId.toString(), input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	public async cancelOrder(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: OrderCancelInput,
	): Promise<Order> {
		return this.orderService.cancelOrder(memberId.toString(), input);
	}

	/* ── Queries ── */

	@UseGuards(AuthGuard)
	@Query(() => [Order])
	public async getMyOrders(@AuthMember('_id') memberId: ObjectId): Promise<Order[]> {
		return this.orderService.getMyOrders(memberId.toString());
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => [Order])
	public async getAllOrders(): Promise<Order[]> {
		return this.orderService.getAllOrders();
	}
}
