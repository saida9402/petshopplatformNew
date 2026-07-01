import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth.service';
import { Member } from 'apps/petoria-api/src/libs/dto/member/member';
import { MemberStatus } from 'apps/petoria-api/src/libs/enums/member.enum';
import { Message } from 'apps/petoria-api/src/libs/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	private readonly logger = new Logger(RolesGuard.name);

	constructor(
		private reflector: Reflector,
		private authService: AuthService,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) return true;

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;

			const bearerToken = request.headers.authorization;
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);
			const token = bearerToken.split(' ')[1];
			let authMember: Member | null = null;
			try {
				authMember = await this.authService.verifyToken(token);
			} catch {
				throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
			}
			if (!authMember) throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);

			// Re-read role and status from DB — never trust the JWT role for
			// access-control decisions. A demoted admin retains a valid token
			// but must not pass role-restricted endpoints.
			const currentMember = await this.memberModel
				.findOne({ _id: authMember._id, memberStatus: MemberStatus.ACTIVE })
				.select('_id memberType memberStatus memberNick')
				.lean()
				.exec();

			if (!currentMember) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

			const hasPermission = roles.includes(currentMember.memberType);
			if (!hasPermission) throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);

			this.logger.debug(`RolesGuard passed [${roles}]: ${currentMember.memberNick}`);
			// Fresh DB data overwrites stale JWT fields
			request.body.authMember = { ...authMember, ...currentMember };
			return true;
		}

		return false;
	}
}
