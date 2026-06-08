import { Schema } from 'mongoose';
import { ProductCategory, ProductStatus, ProductType } from '../libs/enums/product.enum';

const ProductSchema = new Schema(
	{
		productType: {
			type: String,
			enum: Object.values(ProductType), // ✅ massiv sifatida
			required: true,
		},

		productStatus: {
			type: String,
			enum: Object.values(ProductStatus), // ✅ massiv sifatida
			default: ProductStatus.ACTIVE,
			required: true,
		},

		productCategory: {
			type: String,
			enum: Object.values(ProductCategory), // ✅ massiv sifatida
			required: true,
		},

		productName: {
			type: String,
			required: true,
		},

		productBrand: {
			type: String,
			required: true,
		},

		productSize: {
			type: String, // "10kg" | "L size" | "250ml" | "2 ta" | "M"
		},

		productPrice: {
			type: Number,
			required: true,
		},

		productStock: {
			type: Number,
			default: 0,
			required: true,
		},

		productViews: {
			type: Number,
			default: 0,
		},

		productLikes: {
			type: Number,
			default: 0,
		},

		productComments: {
			type: Number,
			default: 0,
		},

		productRank: {
			type: Number,
			default: 0, // yuqori qiymat = "Bestseller" badge
		},

		productImages: {
			type: [String],
			required: true,
		},

		productDesc: {
			type: String,
		},

		productSale: {
			type: Boolean,
			default: false, // "-30%" chegirma badge
		},

		productSalePercent: {
			type: Number,
			default: 0, // chegirma foizi
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		manufacturedAt: {
			type: Date,
		},
	},
	{ timestamps: true },
);

ProductSchema.index(
	{ productType: 1, productCategory: 1, productBrand: 1, productStatus: 1 },
	{ name: 'type-category-brand-status' },
);
ProductSchema.index({ memberId: 1 });
ProductSchema.index({ productStatus: 1 });

export default ProductSchema;
