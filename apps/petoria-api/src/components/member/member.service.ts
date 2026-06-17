import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { SellersInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';

import { StatisticModifier, T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeService } from '../like/like.service';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { escapeRegex, lookupAuthMemberLiked } from '../../libs/config';
import { MemberUpdate, SellerUpdate } from '../../libs/dto/member/member.update';

@Injectable()
export class MemberService {
	private readonly logger = new Logger(MemberService.name);

	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Follow')
		private readonly followModel: Model<Follower | Following>,
		private authService: AuthService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberType = MemberType.USER; // security: always force USER — never trust client-supplied role
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		try {
			const result = await this.memberModel.create(input);
			// TODO: Authentication via TOKEN
			result.accessToken = await this.authService.createToken(result);
			return result;
		} catch (err) {
			this.logger.error('signup failed', err.message);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input;
		const response: Member = await this.memberModel
			.findOne({ memberNick: memberNick })
			.select('+memberPassword')
			.exec();

		// Single generic error for all auth failures — prevents username enumeration.
		// An attacker cannot distinguish "nick not found", "account blocked", or
		// "wrong password" from the response.
		const authError = new BadRequestException('Invalid credentials');

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			// Still run a dummy bcrypt compare to prevent timing-based enumeration
			await this.authService.comparePasswords(memberPassword, '$2b$10$dummyhashfortimingequalityXXXXXXXXXXXXXX');
			throw authError;
		}
		if (response.memberStatus === MemberStatus.BLOCK) {
			await this.authService.comparePasswords(memberPassword, '$2b$10$dummyhashfortimingequalityXXXXXXXXXXXXXX');
			throw authError;
		}

		const isMatch = await this.authService.comparePasswords(memberPassword, response.memberPassword);
		if (!isMatch) throw authError;

		response.accessToken = await this.authService.createToken(response);
		return response;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		// Strip privileged fields — only admins may change role or status
		delete (input as any).memberType;
		delete (input as any).memberStatus;

		// Hash password before persistence if it is being updated
		if (input.memberPassword) {
			input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		}

		const result: Member = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);

		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};
		const targetMember = await this.memberModel.findOne(search).lean().exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}

			const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
			targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);

			targetMember.meFollowed = await this.checkSubscription(memberId, targetId);
		}

		return targetMember;
	}

	private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
		const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();
		return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : [];
	}

	public async getSellers(memberId: ObjectId, input: SellersInquiry): Promise<Members> {
		const { text } = input.search;
		const match: T = { memberType: MemberType.SELLER, memberStatus: MemberStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (text) match.memberNick = { $regex: escapeRegex(text), $options: 'i' };
		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit }, //
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
		const target: Member = await this.memberModel
			.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }) //
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.MEMBER,
		};

		// LIKE TOGGLE via Like modules
		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.memberStatsEditor({ _id: likeRefId, targetKey: 'memberLikes', modifier: modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, memberType, text } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (memberStatus) match.memberStatus = memberStatus;
		if (memberType) match.memberType = memberType;
		if (text) match.memberNick = { $regex: escapeRegex(text), $options: 'i' };

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async getSellerById(memberId: ObjectId, sellerId: ObjectId): Promise<Member> {
		const search: T = {
			_id: sellerId,
			memberType: MemberType.SELLER,
			memberStatus: MemberStatus.ACTIVE,
		};

		const seller = await this.memberModel.findOne(search).lean().exec();
		if (!seller) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId, viewRefId: sellerId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				seller.memberViews++;
			}

			const likeInput = { memberId, likeRefId: sellerId, likeGroup: LikeGroup.MEMBER };
			seller.meLiked = await this.likeService.checkLikeExistence(likeInput);
			seller.meFollowed = await this.checkSubscription(memberId, sellerId);
		}

		return seller;
	}

	public async updateSellerProfile(memberId: ObjectId, input: SellerUpdate): Promise<Member> {
		const result: Member = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberType: MemberType.SELLER,
					memberStatus: MemberStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		// Hash password before persistence if it is being updated
		if (input.memberPassword) {
			input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		}

		const result: Member = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		const { _id, targetKey, modifier } = input;
		return await this.memberModel
			.findByIdAndUpdate(
				_id,
				{
					$inc: { [targetKey]: modifier },
				},
				{ new: true },
			)
			.exec();
	}
}
