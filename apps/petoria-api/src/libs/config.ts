import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

// ─── Seller (Agent o'rniga) ───────────────────────────────────────────────────
export const availableSellerSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];

// ─── Product (Property o'rniga) ───────────────────────────────────────────────
export const availableProductOptions = ['productSale', 'productRent'];
export const availableProductSorts = [
	'createdAt',
	'updatedAt',
	'productLikes',
	'productViews',
	'productRank',
	'productPrice',
];

// ─── Boshqa sortlar ───────────────────────────────────────────────────────────
export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];
export const availableOrderSorts = ['createdAt', 'updatedAt', 'orderTotal'];
// ─── Brendlar ─────────────────────────────────────────────────────────────────
export const availableBrands = [
	'Royal Canin',
	'Purina',
	'Hills',
	'Whiskas',
	'Elanco',
	'Furminator',
	'Kong',
	'PetStyle',
	'Trixie',
	'Ferplast',
	'Catit',
	'Ibiyaya',
];

// ─── Image konfiguratsiyasi ───────────────────────────────────────────────────
export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

// ─── Aggregation pipeline yordamchilari ──────────────────────────────────────
export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

interface LookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
	const { followerId, followingId } = input;
	return {
		$lookup: {
			from: 'follows',
			let: {
				localFollowerId: followerId,
				localFollowingId: followingId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$followerId', '$$localFollowerId'] }, { $eq: ['$followingId', '$$localFollowingId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						followerId: 1,
						followingId: 1,
						myFollowing: '$$localMyFavorite',
					},
				},
			],
			as: 'meFollowed',
		},
	};
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		as: 'followingData',
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};

// ─── Favorite va Visit (property o'rniga product) ────────────────────────────
export const lookupFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteProduct.memberId',
		foreignField: '_id',
		as: 'favoriteProduct.memberData',
	},
};

export const lookupVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedProduct.memberId',
		foreignField: '_id',
		as: 'visitedProduct.memberData',
	},
};
