import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from '../../schemas/Cart.model';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }])],
	providers: [CartResolver, CartService],
	exports: [CartService], // exported for OrderService.checkoutCart()
})
export class CartModule {}
