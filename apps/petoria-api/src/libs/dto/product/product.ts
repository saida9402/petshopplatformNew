import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import {
	ProductCategory,
	PetType,
	ProductBadge,
	ProductStatus,
	ProductUnit,
	ProductSize,
} from '../../enums/product.enum';

// ================================================================
//  product.ts  (DTO papkasida)
//
//  Bu fayl GraphQL @ObjectType larini o'z ichiga oladi.
//  Resolver (product.resolver.ts) Query va Mutation larida
//  shu classlardan birini qaytaradi.
//
//  Next.js tomondan Apollo Client shu typedagi ma'lumotni oladi.
//
//  Faylda 3 ta class bor:
//    1. Product      → bitta mahsulotning to'liq ma'lumoti
//    2. ProductCard  → shop ro'yxatidagi kichik karta (yengil versiya)
//    3. ProductList  → paginated ro'yxat ("124 ta mahsulot topildi")
// ================================================================

// ----------------------------------------------------------------
//  1. PRODUCT
//     Bitta mahsulotning barcha ma'lumotlari.
//     Ishlatiladi:
//       - product(id) query → bitta mahsulot sahifasi
//       - createProduct mutation → yangi mahsulot qaytaradi
//       - updateProduct mutation → yangilangan mahsulot qaytaradi
// ----------------------------------------------------------------
@ObjectType()
export class Product {
	@Field(() => ID)
	id: string;

	// -- Asosiy ma'lumot ------------------------------------------
	@Field()
	name: string;
	// Misol: "Royal Canin Adult"

	@Field()
	brand: string;
	// Misol: "Royal Canin"

	@Field({ nullable: true })
	description?: string;
	// Ixtiyoriy tavsif matni

	// -- Kategoriya va hayvon turi --------------------------------
	@Field(() => ProductCategory)
	category: ProductCategory;
	// Misol: ProductCategory.FOOD

	@Field(() => [PetType])
	petTypes: PetType[];
	// Misol: [PetType.DOG, PetType.CAT]
	// Bir mahsulot bir nechta hayvon uchun bo'lishi mumkin

	// -- Narx -----------------------------------------------------
	@Field(() => Int)
	price: number;
	// Misol: 89000 (so'mda)

	@Field(() => Int)
	discountPercent: number;
	// Misol: 20 → "Sale -20%" badge chiqadi

	@Field(() => Int)
	finalPrice: number;
	// Hisoblanadi: price * (1 - discountPercent / 100)
	// Misol: 89000 * 0.8 = 71200
	// Bu maydon service da hisoblanadi, bazada saqlanmaydi

	// -- Ombor ----------------------------------------------------
	@Field(() => Int)
	stock: number;
	// Omborda nechta dona qolgan

	@Field()
	inStock: boolean;
	// stock > 0 bo'lsa true, aks holda false
	// Bu maydon service da hisoblanadi

	// -- O'lchov --------------------------------------------------
	@Field(() => ProductUnit)
	unit: ProductUnit;
	// Misol: ProductUnit.KG

	@Field(() => Float)
	unitValue: number;
	// Misol: 2.0 → frontendda "2kg" ko'rinishida chiqadi

	@Field(() => ProductSize, { nullable: true })
	size?: ProductSize;
	// Faqat kiyim va aksessuarlarda bo'ladi
	// Misol: ProductSize.M → "M size"

	// -- Badge va rasm --------------------------------------------
	@Field(() => ProductBadge)
	badge: ProductBadge;
	// Misol: ProductBadge.NEW → sariq "Yangi" badge
	// Misol: ProductBadge.SALE → yashil "Sale -20%" badge

	@Field({ nullable: true })
	imageUrl?: string;
	// Asosiy rasm URL manzili

	@Field(() => [String])
	images: string[];
	// Qo'shimcha rasmlar ro'yxati (gallery uchun)

	// -- Holat ----------------------------------------------------
	@Field(() => ProductStatus)
	status: ProductStatus;
	// Misol: ProductStatus.ACTIVE, OUT_OF_STOCK ...

	@Field()
	isActive: boolean;
	// false bo'lsa shop da ko'rinmaydi

	// -- Yetkazib berish ------------------------------------------
	@Field(() => Int, { nullable: true })
	weight?: number;
	// Gramda, yetkazib berish narxini hisoblash uchun

	// -- Statistika -----------------------------------------------
	@Field(() => Float)
	rating: number;
	// O'rtacha baho: 0.0 dan 5.0 gacha
	// Barcha review.rating larning o'rtachasi

	@Field(() => Int)
	reviewCount: number;
	// Nechta izoh yozilgan

	// -- Vaqt -----------------------------------------------------
	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

// ----------------------------------------------------------------
//  2. PRODUCT CARD
//     Shop sahifasidagi mahsulot kartasi uchun yengil versiya.
//     Product ga qaraganda kamroq maydon bor — faqat ro'yxat uchun.
//     Ishlatiladi:
//       - products() query → shop ro'yxati
// ----------------------------------------------------------------
@ObjectType()
export class ProductCard {
	@Field(() => ID)
	id: string;

	@Field()
	name: string;
	// Misol: "Royal Canin Adult"

	@Field()
	brand: string;
	// Misol: "Royal Canin • 2kg" (frontendda birlashtirilib chiqadi)

	@Field(() => Int)
	price: number;
	// Misol: 89000

	@Field(() => Int)
	finalPrice: number;
	// Chegirmadan keyingi narx

	@Field(() => Int)
	discountPercent: number;
	// Misol: 20

	@Field(() => ProductBadge)
	badge: ProductBadge;
	// NEW | SALE | BESTSELLER | NONE

	@Field({ nullable: true })
	imageUrl?: string;

	@Field()
	inStock: boolean;
	// stock > 0

	@Field(() => Float)
	rating: number;
	// Yulduz bahosi
}

// ----------------------------------------------------------------
//  3. PRODUCT LIST
//     Paginated ro'yxat uchun wrapper.
//     Shop sahifasida "124 ta mahsulot topildi" ko'rsatish uchun.
//     Ishlatiladi:
//       - products() query
// ----------------------------------------------------------------
@ObjectType()
export class ProductList {
	@Field(() => [ProductCard])
	data: ProductCard[];
	// Joriy sahifadagi mahsulotlar ro'yxati

	@Field(() => Int)
	total: number;
	// Jami mahsulotlar soni → "124 ta mahsulot topildi"

	@Field(() => Int)
	page: number;
	// Joriy sahifa raqami

	@Field(() => Int)
	limit: number;
	// Bir sahifada nechta mahsulot

	@Field(() => Int)
	totalPages: number;
	// Jami sahifalar soni
}
