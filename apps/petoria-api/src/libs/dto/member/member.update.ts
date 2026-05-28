import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class MemberUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberPhone?: string;

	@IsOptional()
	@Length(3, 20)
	@Field(() => String, { nullable: true })
	memberNick?: string;

	@IsOptional()
	@Length(5, 12)
	@Field(() => String, { nullable: true })
	memberPassword?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberImage?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberDesc?: string;

	deletedAt?: Date;
}

// ─── Seller store socials sub-input ──────────────────────────────────────────

@InputType()
export class StoreSocialsInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	instagram?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	facebook?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	youtube?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	telegram?: string;
}

// ─── Seller profile update input ─────────────────────────────────────────────

@InputType()
export class SellerUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Length(2, 100)
	@Field(() => String, { nullable: true })
	storeName?: string;

	@IsOptional()
	@Length(2, 50)
	@Field(() => String, { nullable: true })
	storeSlug?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	storeLogo?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	storeBanner?: string;

	@IsOptional()
	@Length(5, 1000)
	@Field(() => String, { nullable: true })
	storeDesc?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	storePhone?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	storeEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	storeAddress?: string;

	@IsOptional()
	@Field(() => StoreSocialsInput, { nullable: true })
	storeSocials?: StoreSocialsInput;
}
