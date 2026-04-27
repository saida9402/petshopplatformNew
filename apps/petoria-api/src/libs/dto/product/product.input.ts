import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsArray, IsInt, IsBoolean, IsUrl, Min, Max, MinLength } from 'class-validator';

import { ProductCategory, PetType, ProductBadge, ProductUnit, ProductSize } from '../../enums/product.enum';

// ================================================================
//  product.input.ts  (DTO papkasida)
//
//  Bu faylda faqat bitta class bor: CreateProductInput
//  Ishlatiladi:
//    Mutation → createProduct(input: CreateProductInput): Product
//
//  @InputType()  → GraphQL da input sifatida taniladi
//  @IsString()   → class-validator tekshiradi (ValidationPipe orqali)
// ================================================================

@InputType()
export class CreateProductInput {
	// -- Asosiy ma'lumot ------------------------------------------

	@Field()
	@IsString()
	@MinLength(2)
	name: string;
	// Mahsulot nomi, kamida 2 ta harf
	// Misol: "Royal Canin Adult"

	@Field()
	@IsString()
	brand: string;
	// Brend nomi
	// Misol: "Royal Canin"

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	description?: string;
	// Ixtiyoriy tavsif
	// Yuborilmasa null saqlanadi

	// -- Kategoriya va hayvon turi --------------------------------

	@Field(() => ProductCategory)
	@IsEnum(ProductCategory)
	category: ProductCategory;
	// Misol: ProductCategory.FOOD
	// Faqat enum dagi qiymatlardan biri bo'lishi kerak

	@Field(() => [PetType])
	@IsArray()
	@IsEnum(PetType, { each: true })
	petTypes: PetType[];
	// Misol: [PetType.DOG] yoki [PetType.DOG, PetType.CAT]
	// Kamida bitta hayvon turi ko'rsatilishi kerak

	// -- Narx -----------------------------------------------------

	@Field(() => Int)
	@IsInt()
	@Min(0)
	price: number;
	// So'mda, butun son
	// Misol: 89000
	// Manfiy bo'lmaydi

	@Field(() => Int, { nullable: true, defaultValue: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(100)
	discountPercent?: number;
	// Chegirma foizi, 0 dan 100 gacha
	// Misol: 20 → "Sale -20%" badge chiqadi
	// Yuborilmasa 0 bo'ladi

	// -- Ombor ----------------------------------------------------

	@Field(() => Int)
	@IsInt()
	@Min(0)
	stock: number;
	// Ombordagi miqdor
	// Misol: 50
	// Manfiy bo'lmaydi

	// -- O'lchov --------------------------------------------------

	@Field(() => ProductUnit)
	@IsEnum(ProductUnit)
	unit: ProductUnit;
	// O'lchov birligi
	// Misol: ProductUnit.KG

	@Field(() => Float)
	unitValue: number;
	// O'lchov qiymati
	// Misol: 2.0 → "2kg" ko'rinishida frontendda chiqadi
	// Misol: 400.0 → "400ml"

	@Field(() => ProductSize, { nullable: true })
	@IsOptional()
	@IsEnum(ProductSize)
	size?: ProductSize;
	// Faqat kiyim va aksessuarlarda kerak
	// Misol: ProductSize.M → "M size"
	// Boshqa kategoriyalarda yuborilmaydi

	// -- Badge va rasm --------------------------------------------

	@Field(() => ProductBadge, { nullable: true, defaultValue: ProductBadge.NONE })
	@IsOptional()
	@IsEnum(ProductBadge)
	badge?: ProductBadge;
	// Karta ustidagi yorliq
	// Misol: ProductBadge.NEW → sariq "Yangi"
	// Yuborilmasa NONE bo'ladi

	@Field({ nullable: true })
	@IsOptional()
	@IsUrl()
	imageUrl?: string;
	// Asosiy rasm URL manzili
	// To'g'ri URL bo'lishi kerak

	@Field(() => [String], { nullable: true, defaultValue: [] })
	@IsOptional()
	@IsArray()
	images?: string[];
	// Qo'shimcha rasmlar ro'yxati (gallery uchun)
	// Yuborilmasa bo'sh array bo'ladi

	// -- Yetkazib berish ------------------------------------------

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	@Min(0)
	weight?: number;
	// Gramda, yetkazib berish narxini hisoblash uchun
	// Ixtiyoriy maydon

	// -- Boshqaruv ------------------------------------------------

	@Field({ nullable: true, defaultValue: true })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
	// false bo'lsa shop da ko'rinmaydi
	// Yuborilmasa true bo'ladi
}
