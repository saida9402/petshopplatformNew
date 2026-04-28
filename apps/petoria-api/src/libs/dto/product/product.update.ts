import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ProductUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => ProductType, { nullable: true })
	productType?: ProductType;

	@IsOptional()
	@Field(() => ProductStatus, { nullable: true })
	productStatus?: ProductStatus; // sotuvchi SOLD yoki DELETE qila oladi

	@IsOptional()
	@Field(() => ProductCategory, { nullable: true })
	productCategory?: ProductCategory;

	@IsOptional()
	@Length(2, 100)
	@Field(() => String, { nullable: true })
	productName?: string;

	@IsOptional()
	@Length(2, 100)
	@Field(() => String, { nullable: true })
	productBrand?: string;

	@IsOptional()
	@Length(1, 50)
	@Field(() => String, { nullable: true })
	productSize?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	productPrice?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	productStock?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	productImages?: string[];

	@IsOptional()
	@Length(5, 1000)
	@Field(() => String, { nullable: true })
	productDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	productSale?: boolean;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	productSalePercent?: number;

	soldAt?: Date; // faqat ts uchun — frontenddan kelmaydi, serverda o'rnatiladi
	deletedAt?: Date; // faqat ts uchun — serverda o'rnatiladi

	@IsOptional()
	@Field(() => Date, { nullable: true })
	manufacturedAt?: Date;
}
