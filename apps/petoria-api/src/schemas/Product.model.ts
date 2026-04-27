import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

import {
	ProductCategory,
	PetType,
	ProductBadge,
	ProductStatus,
	ProductUnit,
	ProductSize,
} from '../libs/enums/product.enum';

// ================================================================
//  product.model.ts
//
//  NestJS GraphQL "code-first" yondashuvi uchun model (schema).
//  Bu fayl avtomatik ravishda GraphQL SDL schemani generatsiya qiladi:
//
//  type Product {
//    id: ID!
//    name: String!
//    price: Int!
//    ...
//  }
//
//  Resolver (product.resolver.ts) Query va Mutation larida
//  shu modelni qaytaradi.
// ================================================================

// ----------------------------------------------------------------
//  PRODUCT MODEL
//  GraphQL type: Product
//
//  Ishlatiladi:
//    Query   → product(id: ID!): Product
//    Mutation → createProduct(...): Product
//    Mutation → updateProduct(...): Product
// ----------------------------------------------------------------
@ObjectType({ description: 'Mahsulot modeli' })
export class ProductModel {
	// -- Identifikator -------------------------------------------
	@Field(() => ID, { description: 'Mahsulot unikal IDsi' })
	id: string;

	// -- Asosiy ma'lumot -----------------------------------------
	@Field({ description: 'Mahsulot nomi' })
	name: string;
	// Misol: "Royal Canin Adult"

	@Field({ description: 'Brend nomi' })
	brand: string;
	// Misol: "Royal Canin"

	@Field({ nullable: true, description: 'Mahsulot tavsifi' })
	description?: string;

	// -- Kategoriya va hayvon turi --------------------------------
	@Field(() => ProductCategory, { description: 'Mahsulot kategoriyasi' })
	category: ProductCategory;
	// Misol: FOOD, TOYS, GROOMING ...

	@Field(() => [PetType], { description: 'Qaysi hayvonlar uchun' })
	petTypes: PetType[];
	// Misol: [DOG, CAT] — bir mahsulot bir nechta hayvon uchun

	// -- Narx ----------------------------------------------------
	@Field(() => Int, { description: "Narx (so'mda)" })
	price: number;
	// Misol: 89000

	@Field(() => Int, { description: 'Chegirma foizi (0-100)' })
	discountPercent: number;
	// Misol: 20 → "Sale -20%"

	@Field(() => Int, { description: "Chegirmadan keyingi narx (so'mda)" })
	finalPrice: number;
	// Hisob: price * (1 - discountPercent / 100)
	// Misol: 89000 * 0.80 = 71200

	// -- Ombor ---------------------------------------------------
	@Field(() => Int, { description: 'Ombordagi miqdor' })
	stock: number;

	@Field({ description: 'Omborda bormi (stock > 0)' })
	inStock: boolean;

	// -- O'lchov -------------------------------------------------
	@Field(() => ProductUnit, { description: "O'lchov birligi" })
	unit: ProductUnit;
	// Misol: KG, ML, PIECE

	@Field(() => Float, { description: "O'lchov qiymati" })
	unitValue: number;
	// Misol: 2.0 → frontend "2kg" ko'rsatadi
	// Misol: 400.0 → frontend "400ml" ko'rsatadi

	@Field(() => ProductSize, {
		nullable: true,
		description: "O'lcham (kiyim/aksessuar uchun)",
	})
	size?: ProductSize;
	// Misol: M → "M size"

	// -- Badge va rasm -------------------------------------------
	@Field(() => ProductBadge, { description: 'Karta badge' })
	badge: ProductBadge;
	// NEW → sariq "Yangi"
	// SALE → yashil "Sale -20%"
	// BESTSELLER → sariq "Bestseller"
	// NONE → badge yo'q

	@Field({ nullable: true, description: 'Asosiy rasm URL' })
	imageUrl?: string;

	@Field(() => [String], { description: "Qo'shimcha rasmlar" })
	images: string[];

	// -- Holat ---------------------------------------------------
	@Field(() => ProductStatus, { description: 'Mahsulot holati' })
	status: ProductStatus;
	// ACTIVE | OUT_OF_STOCK | DISCONTINUED | DRAFT

	@Field({ description: "Aktiv (false bo'lsa shopda ko'rinmaydi)" })
	isActive: boolean;

	// -- Yetkazib berish -----------------------------------------
	@Field(() => Int, {
		nullable: true,
		description: "Og'irlik (gramda, yetkazib berish uchun)",
	})
	weight?: number;

	// -- Statistika ----------------------------------------------
	@Field(() => Float, { description: "O'rtacha baho (0.0 - 5.0)" })
	rating: number;

	@Field(() => Int, { description: 'Izohlar soni' })
	reviewCount: number;

	// -- Vaqt ----------------------------------------------------
	@Field({ description: 'Yaratilgan sana' })
	createdAt: Date;

	@Field({ description: 'Yangilangan sana' })
	updatedAt: Date;
}

// ----------------------------------------------------------------
//  PRODUCT CARD MODEL
//  GraphQL type: ProductCard
//
//  Shop sahifasi ro'yxati uchun yengil versiya.
//  Faqat karta ko'rsatish uchun kerakli maydonlar bor.
//
//  Ishlatiladi:
//    Query → products(...): ProductList
// ----------------------------------------------------------------
@ObjectType({ description: "Shop ro'yxati uchun mahsulot kartasi" })
export class ProductCardModel {
	@Field(() => ID)
	id: string;

	@Field({ description: 'Mahsulot nomi' })
	name: string;
	// Misol: "Royal Canin Adult"

	@Field({ description: "Brend va o'lchov" })
	brand: string;
	// Misol: "Royal Canin • 2kg"

	@Field(() => Int, { description: "Asl narx (so'mda)" })
	price: number;

	@Field(() => Int, { description: "Chegirmali narx (so'mda)" })
	finalPrice: number;

	@Field(() => Int, { description: 'Chegirma foizi' })
	discountPercent: number;

	@Field(() => ProductBadge, { description: 'Badge turi' })
	badge: ProductBadge;

	@Field({ nullable: true, description: 'Rasm URL' })
	imageUrl?: string;

	@Field({ description: 'Omborda bormi' })
	inStock: boolean;

	@Field(() => Float, { description: 'Yulduz bahosi' })
	rating: number;
}

// ----------------------------------------------------------------
//  PRODUCT LIST MODEL
//  GraphQL type: ProductList
//
//  Paginated ro'yxat — sahifalash ma'lumotlari bilan.
//  "124 ta mahsulot topildi" ko'rsatish uchun total kerak.
//
//  Ishlatiladi:
//    Query → products(...): ProductList
// ----------------------------------------------------------------
@ObjectType({ description: "Paginated mahsulotlar ro'yxati" })
export class ProductListModel {
	@Field(() => [ProductCardModel], { description: "Mahsulotlar ro'yxati" })
	data: ProductCardModel[];

	@Field(() => Int, { description: 'Jami mahsulotlar soni (124 ta topildi)' })
	total: number;

	@Field(() => Int, { description: 'Joriy sahifa' })
	page: number;

	@Field(() => Int, { description: 'Sahifadagi mahsulotlar soni' })
	limit: number;

	@Field(() => Int, { description: 'Jami sahifalar soni' })
	totalPages: number;
}
