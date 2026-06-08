import { Args, Query, Resolver } from '@nestjs/graphql';
import { ViewService } from './view.service';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { Products } from '../../libs/dto/product/product';

@Resolver()
export class ViewResolver {
	private readonly logger = new Logger(ViewResolver.name);

	constructor(private readonly viewService: ViewService) {}

	@UseGuards(AuthGuard)
	@Query(() => Products)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		this.logger.log('Query: getVisited');
		return await this.viewService.getVisitedProducts(memberId, input);
	}
}
