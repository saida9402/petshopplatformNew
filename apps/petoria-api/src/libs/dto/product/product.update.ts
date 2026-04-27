import { InputType, Field, Int, PartialType, ArgsType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsArray, IsInt, IsBoolean, Min, Max } from 'class-validator';
import {
	ProductCategory,
	PetType,
	ProductBadge,
	ProductStatus,
	ProductSize,
	ProductSortOption,
} from '../../enums/product.enum';
import { CreateProductInput } from './product.input';

// ================================================================
//  product.update.ts  (DTO papkasida)
//
//  Bu faylda 4 ta class bor:
//
//  1. UpdateProductInput  → mahsulotni tahrirlash mutatsiyasi uchun
//  2. UpdateStockInput    → faqat ombor miqdorini yangilash uchun
//  3. ProductFilterInput  → shop sidebar filterlari uchun
//  4. ProductsArgs        → products() query argumentlari uchun
// ================================================================

// ----------------------------------------------------------------
//  1. UPDATE PRODUCT INPUT
//     Ishlatiladi:
//       Mutation → updateProduct(id: ID!, input: UpdateProductInput)
//
//     PartialType(CreateProductInput) nima qiladi:
//       CreateProductInput dagi barcha maydonlarni optional qiladi.
//       Ya'ni faqat o'zgartirmoqchi bo'lgan maydonlarni yuborish kifoya.
//       Misol: faqat narxni o'zgartirish uchun { price: 95000 } yetarli.
// ----------------------------------------------------------------

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
	@Field(() => ProductStatus, { nullable: true })
	@IsOptional()
	@IsEnum(ProductStatus)
	status?: ProductStatus;
	// Mahsulot holatini o'zgartirish uchun
	// Misol: ProductStatus.OUT_OF_STOCK → tugadi deb belgilash
	// Bu maydon CreateProductInput da yo'q, faqat update da bor
}

// ----------------------------------------------------------------
//  2. UPDATE STOCK INPUT
//     Ishlatiladi:
//       Mutation → updateStock(input: UpdateStockInput)
//
//     Faqat ombor miqdorini yangilash kerak bo'lganda ishlatiladi.
//     Misol: sotib olinsa → quantity: -1
//            qaytarilsa  → quantity: +1
//            manual kiritsa → quantity: +50
// ----------------------------------------------------------------

@InputType()
export class UpdateStockInput {
	@Field()
	@IsString()
	productId: string;
	// Qaysi mahsulot ombori yangilanadi
	// Misol: "550e8400-e29b-41d4-a716-446655440000"

	@Field(() => Int)
	@IsInt()
	quantity: number;
	// Musbat (+) → ombor ko'payadi
	// Manfiy (-) → ombor kamayadi
	// Misol: +10 yoki -3

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	reason?: string;
	// Nima sababdan o'zgardi — log uchun
	// Misol: 'purchase' | 'return' | 'manual'
}

// ----------------------------------------------------------------
//  3. PRODUCT FILTER INPUT
//     Ishlatiladi:
//       ProductsArgs ichida → filter maydoni sifatida
//
//     Shop sahifasidagi sidebar filterlarga to'g'ri keladi:
//       - "Hayvon turi" checkbox → petTypes
//       - "Kategoriya" checkbox  → categories
//       - "Brend" checkbox       → brands
//       - "Narx oralig'i" slider → minPrice, maxPrice
//       - Hero search input      → search
// ----------------------------------------------------------------

@InputType()
export class ProductFilterInput {
	@Field(() => [PetType], { nullable: true })
	@IsOptional()
	@IsArray()
	@IsEnum(PetType, { each: true })
	petTypes?: PetType[];
	// Sidebar: "Hayvon turi" checkboxlari
	// Misol: [PetType.DOG, PetType.CAT] → itlar va mushuklar uchun mahsulotlar

	@Field(() => [ProductCategory], { nullable: true })
	@IsOptional()
	@IsArray()
	@IsEnum(ProductCategory, { each: true })
	categories?: ProductCategory[];
	// Sidebar: "Kategoriya" checkboxlari
	// Misol: [ProductCategory.FOOD] → faqat ovqat mahsulotlari

	@Field(() => [String], { nullable: true })
	@IsOptional()
	@IsArray()
	brands?: string[];
	// Sidebar: "Brend" checkboxlari
	// Misol: ['Royal Canin', 'Purina', 'Hills']

	@Field(() => [ProductSize], { nullable: true })
	@IsOptional()
	@IsArray()
	@IsEnum(ProductSize, { each: true })
	sizes?: ProductSize[];
	// O'lcham filteri (kiyim/aksessuar kategoriyasida)
	// Misol: [ProductSize.M, ProductSize.L]

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	@Min(0)
	minPrice?: number;
	// Sidebar: narx slider minimum qiymati
	// Misol: 0 (so'mda)

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	@Min(0)
	maxPrice?: number;
	// Sidebar: narx slider maximum qiymati
	// Misol: 200000 (200 ming so'm)

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	search?: string;
	// Hero sahifasidagi qidiruv input
	// Misol: "Royal Canin" → nom va brendda qidiradi

	@Field({ nullable: true })
	@IsOptional()
	@IsBoolean()
	inStockOnly?: boolean;
	// true → faqat omborda bor mahsulotlar
	// false yoki undefined → hammasi

	@Field(() => ProductBadge, { nullable: true })
	@IsOptional()
	@IsEnum(ProductBadge)
	badge?: ProductBadge;
	// Badge bo'yicha filter
	// Misol: ProductBadge.SALE → faqat chegirmali mahsulotlar
}

// ----------------------------------------------------------------
//  4. PRODUCTS ARGS
//     Ishlatiladi:
//       Query → products(filter, sortBy, page, limit): ProductList
//
//     @ArgsType() — bu GraphQL da argumentlarni
//     bitta input object emas, flat (tekis) holda qabul qiladi.
//
//     Misol query:
//       products(
//         filter: { petTypes: [DOG], minPrice: 0, maxPrice: 200000 }
//         sortBy: PRICE_ASC
//         page: 1
//         limit: 12
//       )
// ----------------------------------------------------------------

@ArgsType()
export class ProductsArgs {
	@Field(() => ProductFilterInput, { nullable: true })
	@IsOptional()
	filter?: ProductFilterInput;
	// Sidebar filterlari
	// Yuborilmasa hamma mahsulotlar qaytadi

	@Field(() => ProductSortOption, {
		nullable: true,
		defaultValue: ProductSortOption.MOST_POPULAR,
	})
	@IsOptional()
	@IsEnum(ProductSortOption)
	sortBy?: ProductSortOption;
	// Sort tartibi
	// Yuborilmasa MOST_POPULAR (eng mashhur) bo'ladi

	@Field(() => Int, { nullable: true, defaultValue: 1 })
	@IsOptional()
	@IsInt()
	@Min(1)
	page?: number;
	// Sahifa raqami, 1 dan boshlanadi
	// Misol: 2 → ikkinchi sahifa

	@Field(() => Int, { nullable: true, defaultValue: 12 })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number;
	// Bir sahifada nechta mahsulot
	// Minimum: 1, Maximum: 50
	// Misol: 12 → bir sahifada 12 ta
}
