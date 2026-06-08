import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { View } from '../../libs/dto/member/view/view';
import { ViewInput } from '../../libs/dto/member/view/view.input';
import { T } from '../../libs/types/common';

import { Products } from '../../libs/dto/product/product';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';

import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';

@Injectable()
export class ViewService {
	private readonly logger = new Logger(ViewService.name);

	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	// ============================================================
	// VIEW RECORD
	// ============================================================
	public async recordView(input: ViewInput): Promise<View | null> {
		try {
			const viewExist = await this.checkViewExistence(input);

			if (!viewExist) {
				this.logger.debug('New view recorded');
				return await this.viewModel.create(input);
			}
			return null;
		} catch (err) {
			this.logger.error('recordView failed', err.message);
			return null;
		}
	}

	private async checkViewExistence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input;
		const search: T = { memberId, viewRefId };

		return await this.viewModel.findOne(search).exec();
	}

	// ============================================================
	// GET VISITED PRODUCTS
	// ============================================================
	public async getVisitedProducts(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
		const { page, limit } = input;

		const match: T = {
			viewGroup: ViewGroup.PRODUCT, // 🔥 MUHIM O'ZGARISH
			memberId: memberId,
		};

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },

				{
					$lookup: {
						from: 'products', // 🔥 collection nomi o'zgardi
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedProduct',
					},
				},

				{ $unwind: '$visitedProduct' },

				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit,
							{ $unwind: '$visitedProduct.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result = {
			list: [],
			metaCounter: data[0].metaCounter,
		};

		result.list = data[0].list.map((ele) => ele.visitedProduct);

		return result;
	}
}
