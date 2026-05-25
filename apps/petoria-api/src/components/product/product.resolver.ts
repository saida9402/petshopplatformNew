import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product, Products } from '../../libs/dto/product/product';
import {
	ProductInput,
	ProductsInquiry,
	SellerProductsInquiry,
	AllProductsInquiry,
} from '../../libs/dto/product/product.input';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver(() => Product)
export class ProductResolver {
	constructor(private readonly productService: ProductService) {}

	// ─── Seller ───────────────────────────────────────────────────────────────────

	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Mutation(() => Product)
	public async createProduct(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: ProductInput,
	): Promise<Product> {
		return await this.productService.createProduct(memberId, input);
	}

	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Query(() => Products)
	public async getSellerProducts(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: SellerProductsInquiry,
	): Promise<Products> {
		return await this.productService.getSellerProducts(memberId, input);
	}

	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Mutation(() => Product)
	public async updateProduct(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: ProductUpdate,
	): Promise<Product> {
		return await this.productService.updateProduct(memberId, input);
	}

	// ─── User / Guest ─────────────────────────────────────────────────────────────

	@UseGuards(WithoutGuard)
	@Query(() => Product)
	public async getProduct(
		@AuthMember('_id') memberId: ObjectId,
		@Args('productId') productId: string,
	): Promise<Product> {
		const pId = shapeIntoMongoObjectId(productId);
		return await this.productService.getProduct(memberId, pId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Products)
	public async getProducts(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: ProductsInquiry,
	): Promise<Products> {
		return await this.productService.getProducts(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Product)
	public async likeTargetProduct(
		@Args('input') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Product> {
		console.log('Mutation: likeTargetProduct');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.productService.likeTargetProduct(memberId, likeRefId);
	}

	// ─── Admin ────────────────────────────────────────────────────────────────────

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Products)
	public async getAllProductsByAdmin(@Args('input') input: AllProductsInquiry): Promise<Products> {
		return await this.productService.getAllProductsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Product)
	public async updateProductByAdmin(@Args('input') input: ProductUpdate): Promise<Product> {
		return await this.productService.updateProductByAdmin(input);
	}
}
