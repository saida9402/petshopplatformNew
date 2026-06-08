import { Args, Query, Resolver } from '@nestjs/graphql';
import { LikeService } from './like.service';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { Products } from '../../libs/dto/product/product';

@Resolver()
export class LikeResolver {
	private readonly logger = new Logger(LikeResolver.name);

	constructor(private readonly likeService: LikeService) {}

	@UseGuards(AuthGuard)
	@Query(() => Products)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		this.logger.log('Query: getFavorites');
		return await this.likeService.getFavoriteProducts(memberId, input);
	}
}
