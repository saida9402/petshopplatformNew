import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Product {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ProductType)
	productType: ProductType; // Itlar | Mushuklar | Qushlar | Baliqlar

	@Field(() => ProductStatus)
	productStatus: ProductStatus; // ACTIVE | SOLD | DELETE

	@Field(() => ProductCategory)
	productCategory: ProductCategory; // Ovqat | Dorilar | Aksessuarlar | O'yinchoqlar

	@Field(() => String)
	productName: string; // "RC Maxi Adult", "Whiskas Tuna", "KONG Extreme"

	@Field(() => String)
	productBrand: string; // "Royal Canin", "Whiskas", "Kong"

	@Field(() => String, { nullable: true })
	productSize?: string; // "10kg", "L size", "250ml", "2 ta", "M"

	@Field(() => Number)
	productPrice: number; // 320_000, 95_000, 58_000 ...

	@Field(() => Int)
	productStock: number; // ombordagi miqdori

	@Field(() => Int)
	productViews: number;

	@Field(() => Int)
	productLikes: number;

	@Field(() => Int)
	productComments: number;

	@Field(() => Int)
	productRank: number; // "Bestseller" badge uchun ishlatiladi

	@Field(() => [String])
	productImages: string[];

	@Field(() => String, { nullable: true })
	productDesc?: string;

	@Field(() => Boolean)
	productSale: boolean; // "-30%" chegirma badge uchun

	@Field(() => Number, { nullable: true })
	productSalePercent?: number; // chegirma foizi, masalan: 30

	@Field(() => String)
	memberId: ObjectId; // mahsulotni qo'shgan sotuvchi

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	manufacturedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** aggregation orqali keladigan ma'lumotlar */
	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Products {
	@Field(() => [Product])
	list: Product[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
