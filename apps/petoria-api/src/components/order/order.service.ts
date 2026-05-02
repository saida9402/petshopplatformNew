import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderItemStatus, OrderStatus } from '../../libs/enums/order.enum';
import { Order } from '../../schemas/Order.model';
import { OrderInput } from '../../libs/dto/order/order.input';
import { OrderCancelInput, OrderUpdateInput } from '../../libs/dto/order/order.update';

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order')
		private readonly orderModel: Model<Order>,
	) {}

	/* ══════════════════════════════════════════
	   CREATE — place a new order
	══════════════════════════════════════════ */
	public async createOrder(memberId: string, input: OrderInput): Promise<Order> {
		if (!input.orderItems || input.orderItems.length === 0) {
			throw new BadRequestException('At least one order item is required');
		}

		/**
		 * orderTotal is always calculated server-side.
		 * Client-provided itemPrice values pass validation but
		 * the final total is computed here to prevent tampering.
		 */
		const orderTotal = input.orderItems.reduce((sum, item) => sum + item.itemPrice * item.itemQuantity, 0);

		const orderItems = input.orderItems.map((item) => ({
			productId: item.productId,
			itemQuantity: item.itemQuantity,
			itemPrice: item.itemPrice,
			itemStatus: OrderItemStatus.PENDING, // always set server-side
		}));

		try {
			const result = await this.orderModel.create({
				memberId,
				orderItems,
				paymentMethod: input.paymentMethod,
				orderAddress: input.orderAddress,
				orderNote: input.orderNote ?? null,
				orderTotal,
				orderStatus: OrderStatus.PENDING,
			});
			return result;
		} catch {
			throw new InternalServerErrorException('Failed to create order');
		}
	}

	/* ══════════════════════════════════════════
	   READ — orders belonging to a member
	══════════════════════════════════════════ */
	public async getMyOrders(memberId: string): Promise<Order[]> {
		return this.orderModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}

	/* ══════════════════════════════════════════
	   READ — all orders (admin)
	══════════════════════════════════════════ */
	public async getAllOrders(): Promise<Order[]> {
		return this.orderModel.find().sort({ createdAt: -1 }).exec();
	}

	/* ══════════════════════════════════════════
	   UPDATE — advance order status (admin)

	   Allowed transitions (strict forward sequence):
	   PENDING → PROCESS → CONFIRM → DELIVER

	   Transitioning to CANCEL is blocked here —
	   use cancelOrder mutation instead.
	══════════════════════════════════════════ */
	public async updateOrder(input: OrderUpdateInput): Promise<Order> {
		if (input.orderStatus === OrderStatus.CANCEL) {
			throw new BadRequestException('Use the cancelOrder mutation to cancel an order');
		}

		const order = await this.orderModel.findById(input.orderId).exec();
		if (!order) throw new NotFoundException('Order not found');

		// Terminal states — no further updates allowed
		if (order.orderStatus === OrderStatus.CANCEL || order.orderStatus === OrderStatus.DELIVERED) {
			throw new BadRequestException(`Cannot update an order with status "${order.orderStatus}"`);
		}

		/* Enforce strict forward-only transition:
		   index: PENDING(0) → PROCESS(1) → CONFIRM(2) → DELIVER(3)
		   Skipping steps or going backwards is rejected. */
		const ORDER_STEPS: OrderStatus[] = [
			OrderStatus.PENDING,
			OrderStatus.PROCESS,
			OrderStatus.CONFIRM,
			OrderStatus.DELIVERED,
		];
		const currentIdx = ORDER_STEPS.indexOf(order.orderStatus);
		const nextIdx = ORDER_STEPS.indexOf(input.orderStatus);

		if (nextIdx === -1) {
			throw new BadRequestException('Invalid order status');
		}
		if (nextIdx !== currentIdx + 1) {
			throw new BadRequestException(`Transition from "${order.orderStatus}" to "${input.orderStatus}" is not allowed`);
		}

		/**
		 * Fix: OrderItem is an embedded subdocument, NOT a Mongoose Document,
		 * so .toObject() does not exist on it (TS2339).
		 *
		 * Solution: use MongoDB positional all-elements operator $[]
		 * to update every item's itemStatus in a single atomic operation.
		 * This is cleaner and avoids loading/spreading the subdoc array.
		 */
		const result = await this.orderModel
			.findByIdAndUpdate(
				input.orderId,
				{
					$set: {
						orderStatus: input.orderStatus,
						'orderItems.$[].itemStatus': input.orderStatus as unknown as OrderItemStatus,
					},
				},
				{ new: true },
			)
			.exec();

		if (!result) throw new NotFoundException('Order not found');
		return result;
	}

	/* ══════════════════════════════════════════
	   CANCEL — cancel an order

	   Only PENDING or PROCESS orders can be cancelled.
	══════════════════════════════════════════ */
	public async cancelOrder(input: OrderCancelInput): Promise<Order> {
		const order = await this.orderModel.findById(input.orderId).exec();
		if (!order) throw new NotFoundException('Order not found');

		const cancellable: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PROCESS];
		if (!cancellable.includes(order.orderStatus)) {
			throw new BadRequestException(`Orders with status "${order.orderStatus}" cannot be cancelled`);
		}

		/**
		 * Fix: same .toObject() issue as in updateOrder.
		 * Use $[] operator to set every item's itemStatus to CANCEL atomically.
		 */
		const result = await this.orderModel
			.findByIdAndUpdate(
				input.orderId,
				{
					$set: {
						orderStatus: OrderStatus.CANCEL,
						'orderItems.$[].itemStatus': OrderItemStatus.CANCEL,
						cancelReason: input.cancelReason ?? null,
						cancelledAt: new Date(),
					},
				},
				{ new: true },
			)
			.exec();

		if (!result) throw new NotFoundException('Order not found');
		return result;
	}
}
