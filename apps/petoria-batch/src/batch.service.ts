import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/petoria-api/src/libs/dto/member/member';
import { Product } from 'apps/petoria-api/src/libs/dto/product/product';

import { MemberStatus, MemberType } from 'apps/petoria-api/src/libs/enums/member.enum';
import { ProductStatus } from 'apps/petoria-api/src/libs/enums/product.enum';

import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.productModel.updateMany({ productStatus: ProductStatus.ACTIVE }, { productRank: 0 }).exec();

		await this.memberModel
			.updateMany({ memberStatus: MemberStatus.ACTIVE, memberType: MemberType.SELLER }, { memberRank: 0 })
			.exec();
	}

	public async batchTopProducts(): Promise<void> {
		await this.productModel
			.updateMany({ productStatus: ProductStatus.ACTIVE }, [
				{
					$set: {
						productRank: {
							$add: [{ $multiply: ['$productLikes', 2] }, { $multiply: ['$productViews', 1] }],
						},
					},
				},
			])
			.exec();
	}

	public async batchTopSellers(): Promise<void> {
		await this.memberModel
			.updateMany({ memberStatus: MemberStatus.ACTIVE, memberType: MemberType.SELLER }, [
				{
					$set: {
						memberRank: {
							$add: [
								{ $multiply: ['$memberProducts', 5] },
								{ $multiply: ['$memberArticles', 3] },
								{ $multiply: ['$memberLikes', 2] },
								{ $multiply: ['$memberViews', 1] },
							],
						},
					},
				},
			])
			.exec();
	}

	public getHello(): string {
		return 'Welcome to Petoria BATCH Server!';
	}
}
