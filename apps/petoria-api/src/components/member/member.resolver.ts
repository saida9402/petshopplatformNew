import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { SellersInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { BadRequestException, InternalServerErrorException, Logger, UseGuards } from '@nestjs/common';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Response } from 'express';

import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Message } from '../../libs/enums/common.enum';
import { createWriteStream } from 'fs';
import * as path from 'path';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { MemberUpdate, SellerUpdate } from '../../libs/dto/member/member.update';
import { Throttle } from '@nestjs/throttler';
import { UPLOAD_TARGETS } from '../../main';

@Resolver()
export class MemberResolver {
	private readonly logger = new Logger(MemberResolver.name);

	constructor(private readonly memberService: MemberService) {}

	private setAuthCookie(res: Response, token: string): void {
		res.cookie('accessToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: '/',
		});
	}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput, @Context('res') res: Response): Promise<Member> {
		this.logger.log('Mutation: signup');
		const member = await this.memberService.signup(input);
		if (member?.accessToken) this.setAuthCookie(res, member.accessToken);
		return member;
	}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput, @Context('res') res: Response): Promise<Member | null> {
		this.logger.log('Mutation: login');
		const member = await this.memberService.login(input);
		if (member?.accessToken) this.setAuthCookie(res, member.accessToken);
		return member;
	}

	@Mutation(() => Boolean)
	public async logout(@Context('res') res: Response): Promise<boolean> {
		this.logger.log('Mutation: logout');
		res.clearCookie('accessToken', { path: '/' });
		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId,
		@Context('res') res: Response,
	): Promise<Member> {
		this.logger.log('Mutation: updateMember');
		delete input._id;
		const member = await this.memberService.updateMember(memberId, input);
		if (member?.accessToken) this.setAuthCookie(res, member.accessToken);
		return member;
	}

	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(@Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
		this.logger.log('Query: getMember');
		const targetId = shapeIntoMongoObjectId(input);
		return this.memberService.getMember(memberId, targetId);
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		this.logger.log(`Query: checkAuth [${memberNick}]`);
		return `Hi ${memberNick}`;
	}

	@UseGuards(WithoutGuard)
	@Query(() => Members)
	public async getSeller(
		@Args('input') input: SellersInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Members> {
		this.logger.log('Query: getSellers');
		return await this.memberService.getSellers(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getSellerById(
		@Args('sellerId') sellerId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		this.logger.log('Query: getSellerById');
		const targetId = shapeIntoMongoObjectId(sellerId);
		return this.memberService.getSellerById(memberId, targetId);
	}

	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateSellerProfile(
		@Args('input') input: SellerUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		this.logger.log('Mutation: updateSellerProfile');
		delete input._id;
		return this.memberService.updateSellerProfile(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async likeTargetMember(
		@Args('memberId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		this.logger.log('Mutation: likeTargetMember');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.memberService.likeTargetMember(memberId, likeRefId);
	}

	/** ADMIN **/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		return await this.memberService.getAllMembersByAdmin(input);
	}

	@Roles(MemberType.USER, MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		this.logger.log('Query: checkAuthRoles');
		return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		this.logger.log('Mutation: updateMemberByAdmin');
		return await this.memberService.updateMemberByAdmin(input);
	}

	/** Uploader **/

	@UseGuards(AuthGuard)
	@Mutation((returns) => String)
	public async imageUploader(
		@Args({ name: 'file', type: () => GraphQLUpload })
		{ createReadStream, filename, mimetype }: FileUpload,
		@Args('target') target: string,
	): Promise<string> {
		if (!UPLOAD_TARGETS.includes(target)) {
			throw new BadRequestException('Invalid upload target');
		}

		if (!filename) {
			throw new BadRequestException(Message.UPLOAD_FAILED);
		}
		if (!validMimeTypes.includes(mimetype)) {
			throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);
		}

		const imageName = getSerialForImage(filename);
		if (!imageName) {
			throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);
		}
		const relativePath = `uploads/${target}/${imageName}`;
		const absolutePath = path.join(process.cwd(), relativePath);
		const stream = createReadStream();

		const result = await new Promise((resolve, reject) => {
			stream
				.pipe(createWriteStream(absolutePath))
				.on('finish', () => resolve(true))
				.on('error', (err) => {
					this.logger.error('imageUploader write error', err);
					reject(false);
				});
		});

		if (!result) {
			throw new BadRequestException(Message.UPLOAD_FAILED);
		}

		this.logger.log(`imageUploader success: ${relativePath}`);
		return relativePath;
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => [String])
	public async imagesUploader(
		@Args('files', { type: () => [GraphQLUpload] })
		files: Promise<FileUpload>[],
		@Args('target') target: string,
	): Promise<string[]> {
		if (!UPLOAD_TARGETS.includes(target)) {
			throw new BadRequestException('Invalid upload target');
		}

		this.logger.log('Mutation: imagesUploader');

		const uploadedImages = [];
		const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
			try {
				const { filename, mimetype, createReadStream } = await img;

				if (!validMimeTypes.includes(mimetype)) throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

				const imageName = getSerialForImage(filename);
				if (!imageName) throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);
				const relativePath = `uploads/${target}/${imageName}`;
				const absolutePath = path.join(process.cwd(), relativePath);
				const stream = createReadStream();

				const result = await new Promise((resolve, reject) => {
					stream
						.pipe(createWriteStream(absolutePath))
						.on('finish', () => resolve(true))
						.on('error', (err) => {
							this.logger.error('[imagesUploader] write error', err);
							reject(false);
						});
				});
				if (!result) throw new BadRequestException(Message.UPLOAD_FAILED);

				uploadedImages[index] = relativePath;
			} catch (err) {
				this.logger.error('imagesUploader: file processing failed', err?.message);
			}
		});

		await Promise.all(promisedList);
		return uploadedImages;
	}
}
