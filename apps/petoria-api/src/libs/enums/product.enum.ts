import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
	DOG = 'DOG', // Itlar
	CAT = 'CAT', // Mushuklar
	BIRD = 'BIRD', // Qushlar
	FISH = 'FISH', // Baliqlar
}
registerEnumType(ProductType, {
	name: 'ProductType',
});

export enum ProductStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(ProductStatus, {
	name: 'ProductStatus',
});

export enum ProductCategory {
	FOOD = 'FOOD',
	MEDICINE = 'MEDICINE',
	ACCESSORY = 'ACCESSORY',
	TOY = 'TOY',
	STROLLER = 'STROLLER',
}
registerEnumType(ProductCategory, {
	name: 'ProductCategory',
});
