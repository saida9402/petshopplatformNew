import { registerEnumType } from '@nestjs/graphql';

// ================================================================
//  product.enum.ts
//  Bu faylda Product modeliga tegishli barcha enumlar yozilgan.
//  registerEnumType() — NestJS GraphQL schemaga ko'rsatish uchun.
// ================================================================

// ------------------------------------------------------------
// 1. Mahsulot kategoriyasi
//    Shop sahifasidagi "Kategoriya" filterda ishlatiladi
//    Misol: FOOD → "Ovqat", TOYS → "O'yinchoqlar"
// ------------------------------------------------------------
export enum ProductCategory {
	FOOD = 'FOOD', // Ovqat
	MEDICINE = 'MEDICINE', // Dorilar
	ACCESSORIES = 'ACCESSORIES', // Aksessuarlar
	TOYS = 'TOYS', // O'yinchoqlar
	HOUSING = 'HOUSING', // Uylar va qafaslar
	CLOTHING = 'CLOTHING', // Kiyimlar
	GROOMING = 'GROOMING', // Parvarish (shampun, taroq...)
}

registerEnumType(ProductCategory, {
	name: 'ProductCategory',
	description: 'Mahsulot kategoriyasi',
	valuesMap: {
		FOOD: { description: 'Ovqat' },
		MEDICINE: { description: 'Dorilar' },
		ACCESSORIES: { description: 'Aksessuarlar' },
		TOYS: { description: "O'yinchoqlar" },
		HOUSING: { description: 'Uylar va qafaslar' },
		CLOTHING: { description: 'Kiyimlar' },
		GROOMING: { description: 'Parvarish' },
	},
});

// ------------------------------------------------------------
// 2. Hayvon turi
//    Shop sahifasidagi "Hayvon turi" filterda ishlatiladi
//    Misol: DOG → "Itlar", CAT → "Mushuklar"
// ------------------------------------------------------------
export enum PetType {
	DOG = 'DOG', // Itlar
	CAT = 'CAT', // Mushuklar
	BIRD = 'BIRD', // Qushlar
	FISH = 'FISH', // Baliqlar
	OTHER = 'OTHER', // Boshqalar
}

registerEnumType(PetType, {
	name: 'PetType',
	description: 'Mahsulot qaysi hayvon uchunligini bildiradi',
	valuesMap: {
		DOG: { description: 'Itlar' },
		CAT: { description: 'Mushuklar' },
		BIRD: { description: 'Qushlar' },
		FISH: { description: 'Baliqlar' },
		OTHER: { description: 'Boshqalar' },
	},
});

// ------------------------------------------------------------
// 3. Mahsulot badge-i (product karta ustidagi yorliq)
//    Misol: NEW → sariq "Yangi", SALE → yashil "Sale -20%"
// ------------------------------------------------------------
export enum ProductBadge {
	NEW = 'NEW', // "Yangi" — sariq badge
	SALE = 'SALE', // "Sale -20%" — yashil badge
	BESTSELLER = 'BESTSELLER', // "Bestseller" — sariq badge
	NONE = 'NONE', // Badge yo'q
}

registerEnumType(ProductBadge, {
	name: 'ProductBadge',
	description: 'Mahsulot kartasidagi badge (Yangi, Sale, Bestseller)',
	valuesMap: {
		NEW: { description: 'Yangi mahsulot' },
		SALE: { description: 'Chegirmali mahsulot' },
		BESTSELLER: { description: "Eng ko'p sotilgan" },
		NONE: { description: "Badge yo'q" },
	},
});

// ------------------------------------------------------------
// 4. Mahsulot holati
//    Admin panelda mahsulotni boshqarish uchun
// ------------------------------------------------------------
export enum ProductStatus {
	ACTIVE = 'ACTIVE', // Faol — sotuvda bor
	OUT_OF_STOCK = 'OUT_OF_STOCK', // Tugagan — omborda yo'q
	DISCONTINUED = 'DISCONTINUED', // To'xtatilgan — endi sotilmaydi
	DRAFT = 'DRAFT', // Qoralama — hali nashr etilmagan
}

registerEnumType(ProductStatus, {
	name: 'ProductStatus',
	description: 'Mahsulotning hozirgi holati',
	valuesMap: {
		ACTIVE: { description: 'Faol, sotuvda mavjud' },
		OUT_OF_STOCK: { description: 'Omborda tugagan' },
		DISCONTINUED: { description: 'Endi sotilmaydi' },
		DRAFT: { description: 'Qoralama, nashr etilmagan' },
	},
});

// ------------------------------------------------------------
// 5. O'lchov birligi
//    Misol: KG → "2kg", ML → "400ml", PIECE → "3 ta"
// ------------------------------------------------------------
export enum ProductUnit {
	KG = 'KG', // Kilogram  → "2kg"
	G = 'G', // Gram      → "500g"
	L = 'L', // Litr      → "1L"
	ML = 'ML', // Millilitr → "400ml"
	PIECE = 'PIECE', // Dona      → "3 ta"
	SET = 'SET', // To'plam   → "1 to'plam"
	SIZE = 'SIZE', // O'lcham   → "M size"
}

registerEnumType(ProductUnit, {
	name: 'ProductUnit',
	description: "O'lchov birligi",
	valuesMap: {
		KG: { description: 'Kilogram' },
		G: { description: 'Gram' },
		L: { description: 'Litr' },
		ML: { description: 'Millilitr' },
		PIECE: { description: 'Dona (ta)' },
		SET: { description: "To'plam" },
		SIZE: { description: "O'lcham (S/M/L)" },
	},
});

// ------------------------------------------------------------
// 6. O'lcham (kiyimlar va aksessuarlar uchun)
//    Misol: M → "M size", L → "L size"
// ------------------------------------------------------------
export enum ProductSize {
	XS = 'XS',
	S = 'S',
	M = 'M',
	L = 'L',
	XL = 'XL',
}

registerEnumType(ProductSize, {
	name: 'ProductSize',
	description: "O'lcham — kiyim va aksessuarlar uchun",
});

// ------------------------------------------------------------
// 7. Sort tartibi
//    Shop sahifasidagi sort dropdown uchun
//    Misol: PRICE_ASC → "Arzon avval"
// ------------------------------------------------------------
export enum ProductSortOption {
	MOST_POPULAR = 'MOST_POPULAR', // Eng mashhur (default)
	PRICE_ASC = 'PRICE_ASC', // Arzon avval
	PRICE_DESC = 'PRICE_DESC', // Qimmat avval
	NEWEST = 'NEWEST', // Yangi avval
}

registerEnumType(ProductSortOption, {
	name: 'ProductSortOption',
	description: 'Sort tartibi',
	valuesMap: {
		MOST_POPULAR: { description: 'Eng mashhur' },
		PRICE_ASC: { description: 'Arzon avval' },
		PRICE_DESC: { description: 'Qimmat avval' },
		NEWEST: { description: 'Yangi avval' },
	},
});
