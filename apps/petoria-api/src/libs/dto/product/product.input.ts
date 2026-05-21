import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';
import { ObjectId } from 'mongoose';
import { availableBrands, availableProductSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class ProductInput {
	@IsNotEmpty()
	@Field(() => ProductType)
	productType: ProductType;

	@IsNotEmpty()
	@Field(() => ProductCategory)
	productCategory: ProductCategory;

	@IsNotEmpty()
	@Length(2, 100)
	@Field(() => String)
	productName: string;

	@IsNotEmpty()
	@Length(2, 100)
	@Field(() => String)
	productBrand: string;

	@IsOptional()
	@Length(1, 50)
	@Field(() => String, { nullable: true })
	productSize?: string; // e.g. "10kg", "L size", "250ml", "2 ta"

	@IsNotEmpty()
	@Field(() => Number)
	productPrice: number;

	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Field(() => Int)
	productStock: number;

	@IsNotEmpty()
	@Field(() => [String])
	productImages: string[];

	@IsOptional()
	@Length(5, 1000)
	@Field(() => String, { nullable: true })
	productDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	productSale?: boolean; // chegirmali mahsulot (-30% kabi)

	@IsOptional()
	@Field(() => Number, { nullable: true })
	productSalePercent?: number; // chegirma foizi

	memberId?: ObjectId; // sotuvchi ID

	@IsOptional()
	@Field(() => Date, { nullable: true })
	manufacturedAt?: Date; // ishlab chiqarilgan sana
}

// ─── Filter yordamchi inputlar ──────────────────────────────────────────────

@InputType()
export class PricesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

// ─── Foydalanuvchi uchun mahsulot qidirish ───────────────────────────────────

@InputType()
class PISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string; // ✅ GraphQL da string sifatida keladi

	@IsOptional()
	@Field(() => [ProductType], { nullable: true })
	typeList?: ProductType[]; // Itlar, Mushuklar, Qushlar, Baliqlar

	@IsOptional()
	@Field(() => [ProductCategory], { nullable: true })
	categoryList?: ProductCategory[]; // Ovqat, Dorilar, Aksessuarlar, O'yinchoqlar

	@IsOptional()
	@IsIn(availableBrands, { each: true })
	@Field(() => [String], { nullable: true })
	brandList?: string[]; // Royal Canin, Purina, Hills, Whiskas ...

	@IsOptional()
	@Field(() => PricesRange, { nullable: true })
	pricesRange?: PricesRange; // narx oralig'i filtri

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	onSale?: boolean; // faqat chegirmali mahsulotlarni ko'rsatish

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string; // matnli qidiruv
}

@InputType()
export class ProductsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableProductSorts)
	@Field(() => String, { nullable: true })
	sort?: string; // "Eng mashhur", "Arzondan qimmatlga" va boshqalar

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => PISearch)
	search: PISearch;
}

// ─── Sotuvchi uchun mahsulot qidirish ───────────────────────────────────────

@InputType()
class SPISearch {
	@IsOptional()
	@Field(() => ProductStatus, { nullable: true })
	productStatus?: ProductStatus;
}

@InputType()
export class SellerProductsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableProductSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => SPISearch)
	search: SPISearch;
}

// ─── Admin uchun barcha mahsulotlarni qidirish ───────────────────────────────

@InputType()
class ALPISearch {
	@IsOptional()
	@Field(() => ProductStatus, { nullable: true })
	productStatus?: ProductStatus;

	@IsOptional()
	@Field(() => [ProductType], { nullable: true })
	productTypeList?: ProductType[];

	@IsOptional()
	@Field(() => [ProductCategory], { nullable: true })
	productCategoryList?: ProductCategory[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class AllProductsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableProductSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ALPISearch)
	search: ALPISearch;
}

// ─── Oddiy sahifalash ────────────────────────────────────────────────────────

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
