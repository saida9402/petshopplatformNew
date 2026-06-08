import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { MeLiked } from '../like/like';
import { MeFollowed } from '../follow/follow';

@ObjectType()
export class StoreSocials {
	@Field(() => String, { nullable: true })
	instagram?: string;

	@Field(() => String, { nullable: true })
	facebook?: string;

	@Field(() => String, { nullable: true })
	youtube?: string;

	@Field(() => String, { nullable: true })
	telegram?: string;
}

@ObjectType()
export class Member {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => MemberType)
	memberType: MemberType;

	@Field(() => MemberStatus)
	memberStatus: MemberStatus;

	@Field(() => MemberAuthType)
	memberAuthType: MemberAuthType;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String)
	memberNick: string;

	// Not exposed via @Field — internal use only (login password comparison)
	memberPassword?: string;

	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@Field(() => String)
	memberImage: string;

	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@Field(() => String, { nullable: true })
	memberDesc?: string;

	// ─── Seller store fields ──────────────────────────────────────────────────

	@Field(() => String, { nullable: true })
	storeName?: string;

	@Field(() => String, { nullable: true })
	storeSlug?: string;

	@Field(() => String, { nullable: true })
	storeLogo?: string;

	@Field(() => String, { nullable: true })
	storeBanner?: string;

	@Field(() => String, { nullable: true })
	storeDesc?: string;

	@Field(() => String, { nullable: true })
	storePhone?: string;

	@Field(() => String, { nullable: true })
	storeEmail?: string;

	@Field(() => String, { nullable: true })
	storeAddress?: string;

	@Field(() => StoreSocials, { nullable: true })
	storeSocials?: StoreSocials;

	@Field(() => Boolean, { nullable: true })
	sellerVerified?: boolean;

	@Field(() => Int)
	memberProducts: number;

	@Field(() => Int)
	memberArticles: number;

	@Field(() => Int)
	memberFollowers: number;

	@Field(() => Int)
	memberFollowings: number;

	@Field(() => Int)
	memberPoints: number;

	@Field(() => Int)
	memberLikes: number;

	@Field(() => Int)
	memberViews: number;

	@Field(() => Int)
	memberComments: number;

	@Field(() => Int)
	memberRank: number;

	@Field(() => Int)
	memberWarnings: number;

	@Field(() => Int)
	memberBlocks: number;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => String, { nullable: true })
	accessToken?: string;

	/** from aggregation **/
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];
}

@ObjectType()
export class TotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}

@ObjectType()
export class Members {
	@Field(() => [Member])
	list: Member[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
