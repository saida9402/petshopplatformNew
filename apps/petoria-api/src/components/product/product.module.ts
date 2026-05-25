import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import ProductSchema from '../../schemas/Product.model';
import { AuthModule } from '../auth/auth.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Product',
				schema: ProductSchema,
			},
		]),
		AuthModule,
		LikeModule,
	],
	providers: [ProductResolver, ProductService],
	exports: [ProductService],
})
export class ProductModule {}
