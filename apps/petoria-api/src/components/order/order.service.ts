import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatus } from '../../libs/enums/order.enum';
import { Order } from '../../schemas/Order.model';
import { OrderInput } from '../../libs/dto/order/order.input';
import { OrderCancelInput, OrderUpdateInput } from '../../libs/dto/order/order.update';

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order')
		private readonly orderModel: Model<Order>,
	) {}

	public async createOrder(memberId: string, input: OrderInput): Promise<Order> {
		// ✅ orderTotal serverda hisoblanadi — frontendga ishonib bo'lmaydi
		const total = input.orderItems.reduce((sum, item) => sum + item.itemPrice * item.itemQuantity, 0);

		const result = await this.orderModel.create({
			memberId,
			orderItems: input.orderItems,
			paymentMethod: input.paymentMethod,
			orderAddress: input.orderAddress,
			orderNote: input.orderNote,
			orderTotal: total,
		});

		return result;
	}

	public async getMyOrders(memberId: string): Promise<Order[]> {
		return await this.orderModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}

	public async getAllOrders(): Promise<Order[]> {
		return await this.orderModel.find().sort({ createdAt: -1 }).exec();
	}

	public async updateOrder(input: OrderUpdateInput): Promise<Order> {
		// ✅ CANCEL ga o'tkazishni bu yerda bloklash — buning uchun cancelOrder bor
		if (input.orderStatus === OrderStatus.CANCEL) {
			throw new BadRequestException('Bekor qilish uchun cancelOrder dan foydalaning');
		}

		const result = await this.orderModel.findByIdAndUpdate(
			input.orderId,
			{ orderStatus: input.orderStatus },
			{ new: true },
		);

		if (!result) throw new NotFoundException('Buyurtma topilmadi');
		return result;
	}

	public async cancelOrder(input: OrderCancelInput): Promise<Order> {
		const order = await this.orderModel.findById(input.orderId);
		if (!order) throw new NotFoundException('Buyurtma topilmadi');

		// ✅ Faqat PENDING yoki PROCESS holatidagi buyurtmani bekor qilish mumkin
		if (![OrderStatus.PENDING, OrderStatus.PROCESS].includes(order.orderStatus)) {
			throw new BadRequestException("Bu buyurtmani bekor qilib bo'lmaydi");
		}

		const result = await this.orderModel.findByIdAndUpdate(
			input.orderId,
			{
				orderStatus: OrderStatus.CANCEL,
				cancelledAt: new Date(),
			},
			{ new: true },
		);

		return result;
	}
}
