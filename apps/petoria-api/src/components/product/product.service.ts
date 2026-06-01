import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
	ProductInput,
	ProductsInquiry,
	SellerProductsInquiry,
	AllProductsInquiry,
} from '../../libs/dto/product/product.input';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { Product, Products } from '../../libs/dto/product/product';
import { ProductStatus } from '../../libs/enums/product.enum';
import { Message } from '../../libs/enums/common.enum';
import { Direction } from '../../libs/enums/common.enum';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel('Product')
		private readonly productModel: Model<Product>,
		@InjectModel('Member')
		private readonly memberModel: Model<Member>,
		private likeService: LikeService,
		private viewService: ViewService,
	) {}

	// ─── Sotuvchi yangi mahsulot qo'shadi ────────────────────────────────────────
	public async createProduct(memberId: ObjectId, input: ProductInput): Promise<Product> {
		input.memberId = memberId;

		let result: Product;
		try {
			result = await this.productModel.create(input);
		} catch (err) {
			console.log('Error ProductService.createProduct:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		try {
			await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberProducts: 1 } }).exec();
		} catch (err) {
			console.log('Error ProductService.createProduct [memberProducts increment]:', err.message);
		}

		return result;
	}

	// ─── Bitta mahsulotni olish (view++ bilan) ───────────────────────────────────
	// public async getProduct(memberId: ObjectId, productId: ObjectId): Promise<Product> {
	// 	const search: any = {
	// 		_id: productId,
	// 		productStatus: ProductStatus.ACTIVE,
	// 	};

	// 	const targetProduct = await this.productModel.findOne(search).lean().exec();
	// 	if (!targetProduct) throw new NotFoundException(Message.NO_DATA_FOUND);

	// 	// Ko'rishlar sonini oshirish
	// 	await this.productStatsEditor({ _id: productId, targetKey: 'productViews', modifier: 1 });

	// 	// aggregation: memberData + meLiked
	// 	const result = await this.productModel
	// 		.aggregate([
	// 			{ $match: search },
	// 			lookupMember,
	// 			{ $unwind: '$memberData' },
	// 			...(memberId ? [lookupAuthMemberLiked(memberId)] : []),
	// 		])
	// 		.exec();

	// 	if (!result.length) throw new NotFoundException(Message.NO_DATA_FOUND);
	// 	return result[0];
	// }

	public async getProduct(memberId: ObjectId, productId: ObjectId): Promise<Product> {
		const search: any = {
			_id: productId,
			productStatus: ProductStatus.ACTIVE,
		};

		const targetProduct = await this.productModel.findOne(search).lean().exec();
		if (!targetProduct) throw new NotFoundException(Message.NO_DATA_FOUND);

		// ✅ Faqat login qilgan user bo'lsa va yangi view bo'lsa oshiradi
		if (memberId) {
			const viewInput = {
				memberId,
				viewRefId: productId,
				viewGroup: ViewGroup.PRODUCT,
			};
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.productStatsEditor({ _id: productId, targetKey: 'productViews', modifier: 1 });
			}
		} else {
			// ✅ Guest user bo'lsa har doim +1 (yoki siz xohlagancha)
			await this.productStatsEditor({ _id: productId, targetKey: 'productViews', modifier: 1 });
		}

		const result = await this.productModel
			.aggregate([
				{ $match: search },
				lookupMember,
				{ $unwind: '$memberData' },
				...(memberId ? [lookupAuthMemberLiked(memberId)] : []),
			])
			.exec();

		if (!result.length) throw new NotFoundException(Message.NO_DATA_FOUND);
		return result[0];
	}

	// ─── Foydalanuvchi mahsulotlarni qidiradi (shop sahifasi) ───────────────────
	public async getProducts(memberId: ObjectId, input: ProductsInquiry): Promise<Products> {
		const { page, limit, sort, direction, search } = input;
		const match: any = { productStatus: search.productStatus ?? ProductStatus.ACTIVE };

		if (search.typeList?.length) match.productType = { $in: search.typeList };
		if (search.categoryList?.length) match.productCategory = { $in: search.categoryList };
		if (search.brandList?.length) match.productBrand = { $in: search.brandList };
		if (search.onSale) match.productSale = true;
		if (search.memberId) match.memberId = shapeIntoMongoObjectId(search.memberId);
		if (search.pricesRange) {
			match.productPrice = {
				$gte: search.pricesRange.start,
				$lte: search.pricesRange.end,
			};
		}
		if (search.text) {
			match.$or = [
				{ productName: { $regex: search.text, $options: 'i' } },
				{ productBrand: { $regex: search.text, $options: 'i' } },
				{ productDesc: { $regex: search.text, $options: 'i' } },
			];
		}

		const sortObj: any = { [sort ?? 'createdAt']: direction ?? Direction.DESC };

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sortObj },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupMember,
							{ $unwind: '$memberData' },
							...(memberId ? [lookupAuthMemberLiked(memberId)] : []),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		return result[0] as Products;
	}

	// ─── Sotuvchi o'z mahsulotlarini ko'radi ────────────────────────────────────
	public async getSellerProducts(memberId: ObjectId, input: SellerProductsInquiry): Promise<Products> {
		const { page, limit, sort, direction, search } = input;
		const match: any = {
			memberId,
			...(search.productStatus ? { productStatus: search.productStatus } : {}),
		};

		const sortObj: any = { [sort ?? 'createdAt']: direction ?? Direction.DESC };

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sortObj },
				{
					$facet: {
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		return result[0] as Products;
	}

	// ─── Sotuvchi o'z mahsulotini yangilaydi ────────────────────────────────────
	public async updateProduct(memberId: ObjectId, input: ProductUpdate): Promise<Product> {
		const { _id, productStatus, ...rest } = input;

		const existing = await this.productModel.findOne({ _id, memberId }).exec();
		if (!existing) throw new NotFoundException(Message.NO_DATA_FOUND);
		if (existing.productStatus === ProductStatus.DELETE) throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);

		// SOLD bo'lsa soldAt vaqtini qo'yish
		if (productStatus === ProductStatus.SOLD) {
			(rest as any).soldAt = new Date();
		}
		// DELETE bo'lsa deletedAt vaqtini qo'yish
		if (productStatus === ProductStatus.DELETE) {
			(rest as any).deletedAt = new Date();
		}

		const result = await this.productModel.findByIdAndUpdate(_id, { productStatus, ...rest }, { new: true }).exec();

		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);

		// Decrement seller's counter only when transitioning into DELETE
		// if (productStatus === ProductStatus.DELETE && existing.productStatus !== ProductStatus.DELETE) {
		// 	try {
		// 		await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberProducts: -1 } }).exec();
		// 	} catch (err) {
		// 		console.log('Error ProductService.updateProduct [memberProducts decrement]:', err.message);
		// 	}
		// } keremas

		return result;
	}

	// ─── Admin barcha mahsulotlarni ko'radi ─────────────────────────────────────
	public async getAllProductsByAdmin(input: AllProductsInquiry): Promise<Products> {
		const { page, limit, sort, direction, search } = input;
		const match: any = {};

		if (search.productStatus) match.productStatus = search.productStatus;
		if (search.productTypeList?.length) match.productType = { $in: search.productTypeList };
		if (search.productCategoryList?.length) match.productCategory = { $in: search.productCategoryList };

		const sortObj: any = { [sort ?? 'createdAt']: direction ?? Direction.DESC };

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sortObj },
				{
					$facet: {
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }, lookupMember, { $unwind: '$memberData' }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		return result[0] as Products;
	}

	// ─── Admin mahsulotni yangilaydi ─────────────────────────────────────────────
	public async updateProductByAdmin(input: ProductUpdate): Promise<Product> {
		const { _id, productStatus, ...rest } = input;

		const existing = await this.productModel.findById(_id).exec();
		if (!existing) throw new NotFoundException(Message.NO_DATA_FOUND);

		if (productStatus === ProductStatus.SOLD) (rest as any).soldAt = new Date();
		if (productStatus === ProductStatus.DELETE) (rest as any).deletedAt = new Date();

		const result = await this.productModel.findByIdAndUpdate(_id, { productStatus, ...rest }, { new: true }).exec();

		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);

		// Decrement seller's counter only when transitioning into DELETE
		if (productStatus === ProductStatus.DELETE && existing.productStatus !== ProductStatus.DELETE) {
			try {
				await this.memberModel.findByIdAndUpdate(existing.memberId, { $inc: { memberProducts: -1 } }).exec();
			} catch (err) {
				console.log('Error ProductService.updateProductByAdmin [memberProducts decrement]:', err.message);
			}
		}

		return result;
	}

	// ─── Like toggle ────────────────────────────────────────────────────────────
	public async likeTargetProduct(memberId: ObjectId, likeRefId: ObjectId): Promise<Product> {
		const target = await this.productModel.findOne({ _id: likeRefId, productStatus: ProductStatus.ACTIVE }).exec();
		if (!target) throw new NotFoundException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PRODUCT,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.productStatsEditor({
			_id: likeRefId,
			targetKey: 'productLikes',
			modifier: modifier,
		});

		if (!result) throw new BadRequestException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	// ─── Like/comment/view statistikasini yangilash ──────────────────────────────
	public async productStatsEditor(input: { _id: ObjectId; targetKey: string; modifier: number }): Promise<Product> {
		const { _id, targetKey, modifier } = input;
		const result = await this.productModel
			.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec();
		if (!result) throw new NotFoundException(Message.NO_DATA_FOUND);
		return result;
	}
}
