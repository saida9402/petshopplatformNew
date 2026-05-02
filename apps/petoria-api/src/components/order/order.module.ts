import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from '../../schemas/Order.model';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }])],
	providers: [OrderResolver, OrderService],
	exports: [OrderService],
})
export class OrderModule {}
